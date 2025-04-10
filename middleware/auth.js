import jwt from 'jsonwebtoken'



export const auth = async (req, res, next) => {

  const token = req.cookies.token

  if(!token){
    console.log('token not found')
  }

  try {

    const decode = jwt.verify(token, process.env.JWTTOKEN)

    req.user = decode

    next()
    
  } catch (error) {
    console.log(error)
  }
}