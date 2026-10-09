// Decides when a drawdown reading should raise a Risk Alert.
//
// The EA reports drawdown every time it moves by 0.5 points, so without this
// the user would get a message each time. Instead: ONE alert when drawdown
// reaches the limit, and no more until it has recovered below the limit and
// crosses it again.
//
// State is kept in memory. If the server restarts while an alert is active,
// the next reading above the limit alerts once more — acceptable for a
// single repeated message, and it avoids a database column for this.

const REARM_MARGIN = 0.5; // points below the limit needed before the next alert

const active = new Set(); // userIds with an alert already sent for the current breach

// Returns 'alert' | 'rearm' | 'none'.
// 'alert' does NOT mark the user as alerted — call markAlerted() once the
// message was really sent, so a failed Telegram call is retried on the next reading.
function evaluateDrawdown(userId, drawdown, limit) {
  const alerted = active.has(userId);

  if (!alerted && drawdown >= limit) return 'alert';

  if (alerted && drawdown < limit - REARM_MARGIN) {
    active.delete(userId);
    return 'rearm';
  }

  return 'none';
}

function markAlerted(userId) {
  active.add(userId);
}

function resetRiskState() {
  active.clear();
}

module.exports = { evaluateDrawdown, markAlerted, resetRiskState, REARM_MARGIN };
