//+------------------------------------------------------------------+
//|                    Telegram Trade Alert MT5                      |
//+------------------------------------------------------------------+
#property strict

input string bot_token           = "YOUR_TELEGRAM_BOT_TOKEN";
input string chat_id             = "YOUR_TELEGRAM_CHAT_ID";
input string webhook_url         = "https://trading-notifier-vrdb.onrender.com/webhook/mt5";
input string webhook_secret      = "YOUR_WEBHOOK_SECRET";
input int    webrequest_timeout  = 5000; // ms
input int    send_delay_ms       = 150;  // ms
input bool   send_pending_alerts = true; // แจ้งเตือน Pending order (ตั้ง/ยกเลิก)
input int    drawdown_check_sec  = 30;   // ตรวจ Drawdown ทุกกี่วินาที (0 = ปิด) — server ตัดสินว่าถึงเกณฑ์หรือยัง
input double drawdown_report_min = 0.5;  // ส่งค่า Drawdown ให้ server เมื่อ >= ค่านี้ (%) ต้องไม่เกิน Max Drawdown ที่ตั้งบนเว็บ

// Disclaimer ต่อท้ายข้อความสัญญาณเทรดทุกอัน (HTML bold ตามที่ parse_mode=HTML ของ Telegram รองรับ)
string DISCLAIMER = "This signal is for analytical and informational purposes only and <b>\"does not constitute investment advice\"</b>.\nPlease practice proper risk management to protect your own interests.";

string WithDisclaimer(string msg)
{
   if(StringLen(TrimStr(msg))==0) return(msg);
   return(msg + "\n─────────────\n" + DISCLAIMER);
}

// เก็บค่าล่าสุดของแต่ละไม้ pending เพื่อเทียบว่า "แก้ไขจริง" หรือไม่
ulong  g_po_ticket[];
double g_po_price[];
double g_po_sl[];
double g_po_tp[];

// กันส่งข้อความซ้ำ: MT5 บางจังหวะยิง OnTradeTransaction ซ้ำสำหรับ deal เดียวกัน
// (พบบ่อยตอนเปิดออเดอร์ตลาด หรือตอน TP/SL ทำงาน)
ulong g_processed_deals[];

bool AlreadyProcessedDeal(ulong deal_ticket)
{
   for(int i=0; i<ArraySize(g_processed_deals); i++)
      if(g_processed_deals[i] == deal_ticket) return(true);
   int n = ArraySize(g_processed_deals);
   ArrayResize(g_processed_deals, n+1);
   g_processed_deals[n] = deal_ticket;
   // เก็บแค่ 50 รายการล่าสุด กันอาร์เรย์บวมไม่มีที่สิ้นสุด
   if(ArraySize(g_processed_deals) > 50)
   {
      for(int i=0; i<ArraySize(g_processed_deals)-1; i++)
         g_processed_deals[i] = g_processed_deals[i+1];
      ArrayResize(g_processed_deals, 50);
   }
   return(false);
}

string TrimStr(string s)
{
   int i=0, j=StringLen(s)-1;
   while(i<=j && (s[i]==' '||s[i]=='\t'||s[i]=='\r'||s[j]=='\n')) i++;
   while(j>=i && (s[j]==' '||s[j]=='\t'||s[j]=='\r'||s[j]=='\n')) j--;
   if(i==0 && j==StringLen(s)-1) return(s);
   if(j < i) return("");
   return(StringSubstr(s,i,j-i+1));
}

// Robust UTF-8 percent-encoding (รองรับ emoji และอักขระพิเศษทั้งหมด)
string URLEncode(string s)
{
   if(StringLen(s)==0) return(s);
   uchar bytes[];
   int len = StringToCharArray(s, bytes, 0, -1, CP_UTF8);
   string out = "";
   for(int i=0; i<len; i++)
   {
      uchar c = bytes[i];
      if(c==0) continue; // ข้าม null terminator
      if((c>='A' && c<='Z') || (c>='a' && c<='z') || (c>='0' && c<='9') ||
         c=='-' || c=='_' || c=='.' || c=='~')
         out += CharToString(c);
      else
         out += StringFormat("%%%02X", c);
   }
   return(out);
}

// Escape string สำหรับใส่ใน JSON value
string JSONEscape(string s)
{
   StringReplace(s, "\\", "\\\\");
   StringReplace(s, "\"", "\\\"");
   StringReplace(s, "\n", "\\n");
   StringReplace(s, "\r", "");
   return(s);
}

// คืน true เมื่อ server รับเรื่องแล้วและเป็นฝ่ายจัดการแจ้งเตือน
//   (ส่ง Telegram ให้แล้ว หรือผู้ใช้ปิดการแจ้งเตือนนี้ไว้บนเว็บ) → EA ไม่ต้องส่งเอง
// คืน false เมื่อส่งไม่ถึง / server error / server ยังไม่มี Chat ID ของผู้ใช้
//   → EA ส่ง Telegram เองเป็นแผนสำรอง จะได้ไม่พลาดสัญญาณ
bool SendWebhook(string action, string symbol, double price, double lot, double pnl = 0.0,
                  ulong position_id = 0, double tp = 0.0, double sl = 0.0, int order_seq = 0)
{
   if(StringLen(webhook_url) == 0) return(false);
   string pnl_str = DoubleToString(pnl, 2);
   string body = "{\"secret\":\"" + webhook_secret + "\","
               + "\"action\":\"" + action + "\","
               + "\"symbol\":\"" + symbol + "\","
               + "\"price\":" + DoubleToString(price, _Digits) + ","
               + "\"lot\":" + DoubleToString(lot, 2) + ","
               + "\"pnl\":" + pnl_str + ","
               + "\"position_id\":" + (string)position_id + ","
               + "\"tp\":" + DoubleToString(tp, _Digits) + ","
               + "\"sl\":" + DoubleToString(sl, _Digits) + ","
               + "\"order_seq\":" + (string)order_seq + "}";
   uchar data[];
   int dlen = StringToCharArray(body, data, 0, -1, CP_UTF8);
   ArrayResize(data, dlen - 1);
   char result[];
   string headers = "Content-Type: application/json\r\n";
   string result_headers = "";
   PrintFormat("SendWebhook calling url=%s action=%s symbol=%s", webhook_url, action, symbol);
   int res = WebRequest("POST", webhook_url, headers, webrequest_timeout, data, result, result_headers);
   if(res == -1)
   {
      PrintFormat("SendWebhook error=%d (4014=URL not allowed in Options)", GetLastError());
      ResetLastError();
      return(false);
   }
   PrintFormat("SendWebhook ok status=%d", res);
   if(res < 200 || res >= 300) return(false);
   string resp = CharArrayToString(result);
   if(StringFind(resp, "\"reason\":\"no_chat_id\"") >= 0) return(false);
   return(true);
}

bool SendTelegramToId(string id, string message)
{
   string url = "https://api.telegram.org/bot" + bot_token + "/sendMessage";
   string body = "{\"chat_id\":\"" + id + "\",\"parse_mode\":\"HTML\",\"disable_web_page_preview\":true,\"text\":\"" + JSONEscape(message) + "\"}";
   uchar data[];
   int dlen = StringToCharArray(body, data, 0, -1, CP_UTF8);
   ArrayResize(data, dlen - 1); // ตัด null terminator

   char result[];
   string headers        = "Content-Type: application/json\r\n";
   string result_headers = "";
   int res = WebRequest("POST", url, headers, webrequest_timeout, data, result, result_headers);
   if(res == -1)
   {
      int err = GetLastError();
      PrintFormat("WebRequest error=%d url=%s", err, url);
      ResetLastError();
      return(false);
   }
   string resp = CharArrayToString(result);
   if(StringFind(resp,"\"ok\":true") >= 0) return(true);
   PrintFormat("Telegram send failed response=%s", resp);
   return(false);
}

void SendTelegram(string message)
{
   if(StringLen(TrimStr(message))==0) return;
   string ids[];
   int n = StringSplit(chat_id, ',', ids);
   if(n<=0) { Print("No chat_id configured."); return; }
   for(int i=0;i<n;i++)
   {
      string id = TrimStr(ids[i]);
      if(StringLen(id)==0) continue;
      bool ok = SendTelegramToId(id, message);
      PrintFormat("SendTelegram to %s result=%s", id, ok ? "OK" : "FAIL");
      Sleep(send_delay_ms);
   }
}

//+------------------------------------------------------------------+
//| เลขลำดับ Order (1,2,3,...) — จับคู่กับ Position ID                |
//| เก็บใน GlobalVariable เพื่อให้คงที่ตลอดอายุออเดอร์ + อยู่รอด restart |
//+------------------------------------------------------------------+
int GetOrderSeq(ulong pos_id)
{
   string key = "TA_POS_" + (string)pos_id;
   if(GlobalVariableCheck(key))
      return((int)GlobalVariableGet(key));        // เคยให้เลขแล้ว → ใช้เลขเดิม
   int next = (int)GlobalVariableGet("TA_SEQ") + 1; // ยังไม่มี → ให้เลขถัดไป
   GlobalVariableSet("TA_SEQ", next);
   GlobalVariableSet(key, next);
   return(next);
}

// ลบ mapping เมื่อออเดอร์ปิดสนิทแล้ว (กัน GlobalVariable สะสม)
void ReleaseOrderSeq(ulong pos_id)
{
   string key = "TA_POS_" + (string)pos_id;
   if(GlobalVariableCheck(key)) GlobalVariableDel(key);
}

bool IsPendingType(ENUM_ORDER_TYPE t)
{
   return(t==ORDER_TYPE_BUY_LIMIT  || t==ORDER_TYPE_SELL_LIMIT ||
          t==ORDER_TYPE_BUY_STOP   || t==ORDER_TYPE_SELL_STOP  ||
          t==ORDER_TYPE_BUY_STOP_LIMIT || t==ORDER_TYPE_SELL_STOP_LIMIT);
}

string OrderTypeStr(ENUM_ORDER_TYPE t)
{
   switch(t)
   {
      case ORDER_TYPE_BUY_LIMIT:       return("BUY LIMIT");
      case ORDER_TYPE_SELL_LIMIT:      return("SELL LIMIT");
      case ORDER_TYPE_BUY_STOP:        return("BUY STOP");
      case ORDER_TYPE_SELL_STOP:       return("SELL STOP");
      case ORDER_TYPE_BUY_STOP_LIMIT:  return("BUY STOP LIMIT");
      case ORDER_TYPE_SELL_STOP_LIMIT: return("SELL STOP LIMIT");
      default:                         return("ORDER");
   }
}

bool IsBuySide(ENUM_ORDER_TYPE t)
{
   return(t==ORDER_TYPE_BUY_LIMIT || t==ORDER_TYPE_BUY_STOP || t==ORDER_TYPE_BUY_STOP_LIMIT);
}

//--- จัดการตารางค่าล่าสุดของไม้ pending (ใช้กรอง update ที่ไม่ใช่การแก้จริง) ---
int FindPending(ulong ticket)
{
   for(int i=0; i<ArraySize(g_po_ticket); i++)
      if(g_po_ticket[i] == ticket) return(i);
   return(-1);
}

// คืน true ถ้าค่าเปลี่ยนจริง (พร้อมบันทึกค่าใหม่), false ถ้าเหมือนเดิม
bool PendingChanged(ulong ticket, double price, double sl, double tp)
{
   int idx = FindPending(ticket);
   if(idx < 0) // ไม้ใหม่ → บันทึกไว้ ถือว่าเปลี่ยน
   {
      int n = ArraySize(g_po_ticket);
      ArrayResize(g_po_ticket, n+1);
      ArrayResize(g_po_price,  n+1);
      ArrayResize(g_po_sl,     n+1);
      ArrayResize(g_po_tp,     n+1);
      g_po_ticket[n]=ticket; g_po_price[n]=price; g_po_sl[n]=sl; g_po_tp[n]=tp;
      return(true);
   }
   if(g_po_price[idx]==price && g_po_sl[idx]==sl && g_po_tp[idx]==tp)
      return(false); // ค่าเหมือนเดิม → ไม่ใช่การแก้ไขจริง
   g_po_price[idx]=price; g_po_sl[idx]=sl; g_po_tp[idx]=tp;
   return(true);
}

void RemovePending(ulong ticket)
{
   int idx = FindPending(ticket);
   if(idx < 0) return;
   int last = ArraySize(g_po_ticket) - 1;
   g_po_ticket[idx]=g_po_ticket[last];
   g_po_price[idx] =g_po_price[last];
   g_po_sl[idx]    =g_po_sl[last];
   g_po_tp[idx]    =g_po_tp[last];
   ArrayResize(g_po_ticket, last);
   ArrayResize(g_po_price,  last);
   ArrayResize(g_po_sl,     last);
   ArrayResize(g_po_tp,     last);
}

//+------------------------------------------------------------------+
//| Drawdown = เงินในบัญชี (equity) ลดลงจากจุดสูงสุดที่เคยทำได้ (%)    |
//| EA แค่วัดและรายงาน — server เทียบกับ Max Drawdown ของผู้ใช้        |
//+------------------------------------------------------------------+
double g_last_dd_sent = 0.0;   // ค่าล่าสุดที่ส่งให้ server (0 = ยังไม่ได้ส่ง/ส่งค่ากลับสู่ปกติแล้ว)
bool   g_dd_synced   = false;  // ส่งค่าแรกหลัง EA เริ่มทำงานให้ server แล้วหรือยัง

string PeakKey()
{
   return("TA_PEAK_" + (string)AccountInfoInteger(ACCOUNT_LOGIN));
}

// เริ่มนับจุดสูงสุดใหม่จาก equity ปัจจุบัน — ฝาก/ถอนเงินจะทำให้จุดสูงสุดเก่าใช้ไม่ได้
// (ถอนเงินแล้วจะดูเหมือน drawdown ทั้งที่ไม่ได้ขาดทุน)
// (ไม่ล้าง g_last_dd_sent: ถ้าเคยส่งค่า drawdown สูงไปแล้ว รอบถัดไป CheckDrawdown จะเห็น
//  drawdown ~0 แล้วส่ง "กลับสู่ปกติ" ให้ server ปลดการเตือน ไม่งั้นรอบหน้าจะไม่ถูกเตือน)
void ResetPeakEquity()
{
   GlobalVariableSet(PeakKey(), AccountInfoDouble(ACCOUNT_EQUITY));
}

bool SendDrawdown(double dd, double equity, double peak)
{
   if(StringLen(webhook_url) == 0) return(false);
   string url = webhook_url + "/drawdown"; // .../webhook/mt5/drawdown
   string body = "{\"secret\":\"" + webhook_secret + "\","
               + "\"drawdown\":" + DoubleToString(dd, 2) + ","
               + "\"equity\":" + DoubleToString(equity, 2) + ","
               + "\"peak\":" + DoubleToString(peak, 2) + ","
               + "\"balance\":" + DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE), 2) + ","
               + "\"currency\":\"" + AccountInfoString(ACCOUNT_CURRENCY) + "\"}";
   uchar data[];
   int dlen = StringToCharArray(body, data, 0, -1, CP_UTF8);
   ArrayResize(data, dlen - 1);
   char result[];
   string headers = "Content-Type: application/json\r\n";
   string result_headers = "";
   int res = WebRequest("POST", url, headers, webrequest_timeout, data, result, result_headers);
   if(res == -1)
   {
      PrintFormat("SendDrawdown error=%d (4014=URL not allowed in Options)", GetLastError());
      ResetLastError();
      return(false);
   }
   PrintFormat("SendDrawdown dd=%.2f%% status=%d", dd, res);
   return(res >= 200 && res < 300);
}

void CheckDrawdown()
{
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double peak = GlobalVariableCheck(PeakKey()) ? GlobalVariableGet(PeakKey()) : equity;
   if(equity > peak) peak = equity;
   GlobalVariableSet(PeakKey(), peak);
   if(peak <= 0.0) return;

   double dd = (peak - equity) / peak * 100.0;
   bool above = (dd >= drawdown_report_min);

   // ส่งค่าแรกทุกครั้งที่ EA เริ่มทำงาน: ถ้า drawdown ลดลงระหว่างที่ EA ปิดอยู่
   // server จะได้ปลดการเตือนที่ค้างไว้ (ไม่งั้นรอบหน้าที่ข้ามเกณฑ์จะไม่ถูกเตือน)
   if(!g_dd_synced)
   {
      if(SendDrawdown(dd, equity, peak))
      {
         g_dd_synced = true;
         g_last_dd_sent = above ? dd : 0.0;
      }
      return;
   }

   // รายงานเมื่อถึงเกณฑ์ขั้นต่ำและค่าขยับ >= 0.5 จุดจากที่ส่งล่าสุด (กัน server ถูกยิงถี่ๆ)
   // และรายงานอีกครั้งตอนกลับต่ำกว่าเกณฑ์ เพื่อให้ server "ปลด" การเตือนไว้เตือนรอบหน้า
   // ถ้าส่งไม่สำเร็จจะไม่จำค่า → ลองใหม่รอบถัดไป
   if(above && (g_last_dd_sent == 0.0 || MathAbs(dd - g_last_dd_sent) >= 0.5))
   {
      if(SendDrawdown(dd, equity, peak)) g_last_dd_sent = dd;
   }
   else if(!above && g_last_dd_sent > 0.0)
   {
      if(SendDrawdown(dd, equity, peak)) g_last_dd_sent = 0.0;
   }
}

int OnInit()
{
   if(drawdown_check_sec > 0) EventSetTimer(drawdown_check_sec);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   EventKillTimer();
}

void OnTimer()
{
   CheckDrawdown();
}

// helper: get position TP/SL for symbol; return "-" if not set or no position
void GetPositionSLTP(string symbol, string &sl_str, string &tp_str, int digits)
{
   sl_str = "-";
   tp_str = "-";
   if(!PositionSelect(symbol)) return;
   double sl = PositionGetDouble(POSITION_SL);
   double tp = PositionGetDouble(POSITION_TP);
   if(sl != 0.0) sl_str = DoubleToString(sl, digits);
   if(tp != 0.0) tp_str = DoubleToString(tp, digits);
}

// Main handler using history deal fields
void OnTradeTransaction(
   const MqlTradeTransaction &trans,
   const MqlTradeRequest &request,
   const MqlTradeResult &result)
{
   // === MODIFY: SL/TP ถูกแก้ไข (อ้างอิง Order # เดิมเพื่ออัพเดตออเดอร์นั้น) ===
   if(trans.type == TRADE_TRANSACTION_REQUEST && request.action == TRADE_ACTION_SLTP)
   {
      string m_symbol = request.symbol;
      int m_digits = (int)SymbolInfoInteger(m_symbol, SYMBOL_DIGITS);
      if(m_digits < 0) m_digits = _Digits;
      ulong  m_pos  = request.position;
      string m_typ  = "-", m_icon = "⚪", m_lot = "";
      if(PositionSelectByTicket(m_pos))
      {
         long pt = PositionGetInteger(POSITION_TYPE);
         m_typ  = (pt == POSITION_TYPE_BUY ? "BUY" : "SELL");
         m_icon = (pt == POSITION_TYPE_BUY ? "🟢" : "🔴");
         m_lot  = "  ·  " + DoubleToString(PositionGetDouble(POSITION_VOLUME), 2) + " lot";
      }
      string m_sl = (request.sl != 0.0 ? DoubleToString(request.sl, m_digits) : "-");
      string m_tp = (request.tp != 0.0 ? DoubleToString(request.tp, m_digits) : "-");

      string m_msg = "";
      m_msg += "✏️ <b>TRADE MODIFIED</b>\n";
      m_msg += m_icon + " <b>" + m_typ + "</b>  ·  " + m_symbol + m_lot + "\n";
      m_msg += "🧾 Order #" + (string)GetOrderSeq(m_pos) + "\n";
      m_msg += "─────────────\n";
      m_msg += "🎯 TP       " + m_tp + "\n";
      m_msg += "🛑 SL       " + m_sl;
      SendTelegram(WithDisclaimer(m_msg));
      return;
   }

   // === PENDING ORDER: ตั้งคำสั่ง limit/stop ===
   if(send_pending_alerts && trans.type == TRADE_TRANSACTION_ORDER_ADD && IsPendingType(trans.order_type))
   {
      int pdig = (int)SymbolInfoInteger(trans.symbol, SYMBOL_DIGITS);
      if(pdig < 0) pdig = _Digits;
      string picon = IsBuySide(trans.order_type) ? "🟢" : "🔴";
      string psl = (trans.price_sl != 0.0 ? DoubleToString(trans.price_sl, pdig) : "-");
      string ptp = (trans.price_tp != 0.0 ? DoubleToString(trans.price_tp, pdig) : "-");

      string pmsg = "";
      pmsg += "⏳ <b>PENDING ORDER</b>\n";
      pmsg += picon + " <b>" + OrderTypeStr(trans.order_type) + "</b>  ·  " + trans.symbol
            + "  ·  " + DoubleToString(trans.volume, 2) + " lot\n";
      pmsg += "─────────────\n";
      pmsg += "💵 Price    <b>" + DoubleToString(trans.price, pdig) + "</b>\n";
      pmsg += "🎯 TP       " + ptp + "\n";
      pmsg += "🛑 SL       " + psl;
      SendTelegram(WithDisclaimer(pmsg));
      // บันทึกค่าตั้งต้น เพื่อใช้เทียบกับ update ครั้งถัดไป
      PendingChanged(trans.order, trans.price, trans.price_sl, trans.price_tp);
      return;
   }

   // === PENDING ORDER: ถูกแก้ไข (ราคา / TP / SL) ===
   // ใช้ ORDER_UPDATE + เช็คว่ายังเป็น pending ที่ตั้งอยู่ (PLACED) เพื่อกันยิงตอนถูกทริกเกอร์
   if(send_pending_alerts && trans.type == TRADE_TRANSACTION_ORDER_UPDATE
      && IsPendingType(trans.order_type) && trans.order_state == ORDER_STATE_PLACED)
   {
      // ข้าม update ที่ค่าไม่เปลี่ยน (auto-update หลังตั้ง / update ตอนไม้ถูกทริกเกอร์)
      if(!PendingChanged(trans.order, trans.price, trans.price_sl, trans.price_tp))
         return;
      int pdig = (int)SymbolInfoInteger(trans.symbol, SYMBOL_DIGITS);
      if(pdig < 0) pdig = _Digits;
      string picon = IsBuySide(trans.order_type) ? "🟢" : "🔴";
      string psl = (trans.price_sl != 0.0 ? DoubleToString(trans.price_sl, pdig) : "-");
      string ptp = (trans.price_tp != 0.0 ? DoubleToString(trans.price_tp, pdig) : "-");

      string pmsg = "";
      pmsg += "✏️ <b>PENDING MODIFIED</b>\n";
      pmsg += picon + " <b>" + OrderTypeStr(trans.order_type) + "</b>  ·  " + trans.symbol
            + "  ·  " + DoubleToString(trans.volume, 2) + " lot\n";
      pmsg += "─────────────\n";
      pmsg += "💵 Price    <b>" + DoubleToString(trans.price, pdig) + "</b>\n";
      pmsg += "🎯 TP       " + ptp + "\n";
      pmsg += "🛑 SL       " + psl;
      SendTelegram(WithDisclaimer(pmsg));
      return;
   }

   // === PENDING ORDER: ถูกยกเลิก / หมดอายุ (ถ้าถูกทริกเกอร์จะไปแจ้งเป็น NEW TRADE แทน) ===
   if(send_pending_alerts && trans.type == TRADE_TRANSACTION_ORDER_DELETE && IsPendingType(trans.order_type))
   {
      RemovePending(trans.order); // ไม้นี้จบแล้ว → ล้างค่าที่เก็บไว้
      if(trans.order_state == ORDER_STATE_FILLED || trans.order_state == ORDER_STATE_PARTIAL)
         return; // ทริกเกอร์แล้ว → ปล่อยให้ NEW TRADE จัดการ
      string picon = IsBuySide(trans.order_type) ? "🟢" : "🔴";
      string pmsg = "";
      pmsg += "🚫 <b>PENDING CANCELLED</b>\n";
      pmsg += picon + " <b>" + OrderTypeStr(trans.order_type) + "</b>  ·  " + trans.symbol
            + "  ·  " + DoubleToString(trans.volume, 2) + " lot";
      SendTelegram(WithDisclaimer(pmsg));
      return;
   }

   if(trans.type != TRADE_TRANSACTION_DEAL_ADD) return;
   if(trans.deal == 0) return;
   if(AlreadyProcessedDeal(trans.deal)) return; // กันยิงซ้ำ

   ulong deal_ticket = trans.deal;
   if(!HistoryDealSelect(deal_ticket))
   {
      Sleep(50);
      if(!HistoryDealSelect(deal_ticket))
      {
         PrintFormat("Cannot select deal %I64u", deal_ticket);
         return;
      }
   }

   int deal_entry = (int)HistoryDealGetInteger(deal_ticket, DEAL_ENTRY);       // IN / OUT
   int deal_type  = (int)HistoryDealGetInteger(deal_ticket, DEAL_TYPE);        // BUY / SELL
   // เงินเข้า/ออกบัญชี, เครดิต, คอมมิชชั่น ฯลฯ ไม่ใช่การเทรด → ไม่แจ้งเป็น "NEW TRADE"
   // และไม่บันทึกเป็นไม้ (เดิม deal ชนิดอื่นจะถูกส่งเป็น sell) ฝาก/ถอนต้องเริ่มนับ Drawdown ใหม่
   if(deal_type != DEAL_TYPE_BUY && deal_type != DEAL_TYPE_SELL)
   {
      if(deal_type == DEAL_TYPE_BALANCE) ResetPeakEquity();
      return;
   }
   double deal_volume = HistoryDealGetDouble(deal_ticket, DEAL_VOLUME);
   double deal_price  = HistoryDealGetDouble(deal_ticket, DEAL_PRICE);
   double deal_profit = HistoryDealGetDouble(deal_ticket, DEAL_PROFIT);
   string symbol = HistoryDealGetString(deal_ticket, DEAL_SYMBOL);
   if(StringLen(symbol) == 0) symbol = trans.symbol;
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   if(digits < 0) digits = _Digits;
   string typ = (deal_type == DEAL_TYPE_BUY ? "BUY" : (deal_type == DEAL_TYPE_SELL ? "SELL" : "OTHER"));
   // ไอคอนตามทิศทาง: BUY = เขียว, SELL = แดง
   string dir_icon = (deal_type == DEAL_TYPE_BUY ? "🟢" : (deal_type == DEAL_TYPE_SELL ? "🔴" : "⚪"));
   string lot_str  = DoubleToString(deal_volume, 2);
   string headline = dir_icon + " <b>" + typ + "</b>  ·  " + symbol + "  ·  " + lot_str + " lot";
   string sep = "─────────────";
   // Order # = เลขลำดับ 1,2,3,... จับคู่กับ Position ID (คงที่ตลอด: เปิด → แก้ไข → ปิด)
   ulong  pos_id = (ulong)HistoryDealGetInteger(deal_ticket, DEAL_POSITION_ID);
   int    order_seq = GetOrderSeq(pos_id);
   string order_line = "🧾 Order #" + (string)order_seq;

   // get current position SL/TP (if exists)
   string sl_str, tp_str;
   GetPositionSLTP(symbol, sl_str, tp_str, digits);

   // OPEN
   if(deal_entry == DEAL_ENTRY_IN)
   {
      string msg = "";
      msg += "🆕 <b>NEW TRADE</b>\n";
      msg += headline + "\n";
      msg += order_line + "\n";
      msg += sep + "\n";
      msg += "💵 Entry    <b>" + DoubleToString(deal_price, digits) + "</b>\n";
      msg += "🎯 TP       " + tp_str + "\n";
      msg += "🛑 SL       " + sl_str;
      // raw SL/TP for Supabase (selected by position ticket, not symbol,
      // so it's correct even with multiple positions on the same symbol)
      double raw_sl = 0.0, raw_tp = 0.0;
      if(PositionSelectByTicket(pos_id))
      {
         raw_sl = PositionGetDouble(POSITION_SL);
         raw_tp = PositionGetDouble(POSITION_TP);
      }
      // server ส่ง Telegram ให้ตามการตั้งค่าบนเว็บ — EA ส่งเองเฉพาะเมื่อ server ไม่รับเรื่อง
      if(!SendWebhook(typ == "BUY" ? "buy" : "sell", symbol, deal_price, deal_volume, 0.0, pos_id, raw_tp, raw_sl, order_seq))
         SendTelegram(WithDisclaimer(msg));
      return;
   }

   // CLOSE
   if(deal_entry == DEAL_ENTRY_OUT)
   {
      string profit_str = DoubleToString(deal_profit, 2);
      if(deal_profit > 0) profit_str = "+" + profit_str;
      // ไอคอนผลลัพธ์: กำไร = ✅, ขาดทุน = ❌, เสมอ = ➖
      string result_icon = (deal_profit > 0 ? "✅" : (deal_profit < 0 ? "❌" : "➖"));

      string msg = "";
      msg += result_icon + " <b>TRADE CLOSED</b>\n";
      msg += headline + "\n";
      msg += order_line + "\n";
      msg += sep + "\n";
      msg += "💵 Exit     " + DoubleToString(deal_price, digits) + "\n";
      msg += "💰 Profit   <b>" + profit_str + "$</b>";
      // server ส่ง Telegram ให้ตามการตั้งค่าบนเว็บ — EA ส่งเองเฉพาะเมื่อ server ไม่รับเรื่อง
      // เหตุผลที่ไม้ถูกปิด: ชน TP → "tp", ชน SL / stop out → "sl", ปิดเอง/อื่นๆ → "close"
      // server ใช้แยกสวิตช์ TP/SL กับ "ปิดออเดอร์" บนเว็บ
      long deal_reason = HistoryDealGetInteger(deal_ticket, DEAL_REASON);
      string close_action = "close";
      if(deal_reason == DEAL_REASON_TP) close_action = "tp";
      else if(deal_reason == DEAL_REASON_SL || deal_reason == DEAL_REASON_SO) close_action = "sl";
      if(!SendWebhook(close_action, symbol, deal_price, deal_volume, deal_profit, pos_id, 0.0, 0.0, order_seq))
         SendTelegram(WithDisclaimer(msg));
      // ปิดสนิทแล้ว (ไม่มี position เหลือ) → คืนเลขลำดับ กัน GlobalVariable สะสม
      if(!PositionSelectByTicket(pos_id)) ReleaseOrderSeq(pos_id);
      return;
   }

   // fallback generic (no time shown)
   {
      string msg = "";
      msg += "ℹ️ <b>DEAL</b>\n";
      msg += headline + "\n";
      msg += order_line + "\n";
      msg += sep + "\n";
      msg += "💵 Price    " + DoubleToString(deal_price, digits) + "\n";
      msg += "🎯 TP       " + tp_str + "\n";
      msg += "🛑 SL       " + sl_str;
      SendTelegram(WithDisclaimer(msg));
   }
}
