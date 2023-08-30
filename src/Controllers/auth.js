

const firebase = require("./../Config/firebase")



class AuthController {
    static async signup(req, res) {
        if (!req.body.email || !req.body.password) {
            return res.status(422).json("email and password required");
        }
        firebase
            .auth()
            .createUserWithEmailAndPassword(req.body.email, req.body.password)
            .then((data) => {
                return res.status(201).json(data);
            })
            .catch(function (error) {
                let errorCode = error.code;
                let errorMessage = error.message;
                if (errorCode == "auth/weak-password") {
                    return res.status(500).json({ error: errorMessage });
                } else {
                    return res.status(500).json({ error: errorMessage });
                }
            });
    }

    static async signin(req, res) {
        if (!req.body.email || !req.body.password) {
            return res.status(422).json({
              email: "email is required",
              password: "password is required",
            });
        }
        firebase
            .auth()
            .signInWithEmailAndPassword(req.body.email, req.body.password)
            .then((user) => {
                return res.status(200).json(user);
            })
            .catch(function (error) {
                let errorCode = error.code;
                let errorMessage = error.message;
                if (errorCode === "auth/wrong-password") {
                    return res.status(500).json({ error: errorMessage });
                } else {
                    return res.status(500).json({ error: errorMessage });
                }
            });
    }
}




module.exports = AuthController;