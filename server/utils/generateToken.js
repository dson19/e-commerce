import jwt from "jsonwebtoken";

export const generateToken = (id, role) => {

  const payload = {
    id: id,      
    role: role   
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d" 
  });
};