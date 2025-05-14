import jwt from 'jsonwebtoken';

export const generateToken = (user, res) => {
  const token = jwt.sign({ _id:user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  

  res.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure:false,
    sameSite: 'strict',
  });
};
