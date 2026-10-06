import jwt from "jsonwebtoken"

export function signToken(id: number) {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: "30d",
    })
}
