// Authentication Controller for UPT Resor LAA 1.9 Jatinegara
// Login Pengaman Admin: User (1.9), Password 3 angka (191)

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan Password wajib diisi!',
      });
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();

    // Verifikasi kredensial: user '1.9' dan password '191'
    if (cleanUsername === '1.9' && cleanPassword === '191') {
      return res.json({
        success: true,
        message: 'Login Administrator UPT Resor LAA 1.9 berhasil!',
        data: {
          username: '1.9',
          role: 'ADMIN',
          displayName: 'Administrator UPT Resor LAA 1.9',
          token: 'laa-admin-upt-1.9-' + Date.now(),
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Username atau Password salah! (Gunakan User: 1.9 dan Password: 191)',
    });
  } catch (error) {
    console.error('Error in authController.login:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server autentikasi',
    });
  }
};
