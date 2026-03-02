export const logout = async (req, res) => {
  const clearSessionCookie = () => {
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  };

  if (req.session) {
    req.session.destroy((err) => {
      if (err) console.error('Error destroying session:', err);
      clearSessionCookie();
    });
  } else {
    clearSessionCookie();
  }
};