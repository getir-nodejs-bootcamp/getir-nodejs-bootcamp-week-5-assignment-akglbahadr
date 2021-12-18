const hs = require("http-status");
const { list, insert, findOne } = require("../services/Users");
const { passwordToHash, generateJWTAccessToken, generateJWTRefreshToken } = require("../scripts/utils/helper");

const index = (req, res) => {
  list()
    .then((userList) => {
      if (!userList) res.status(hs.INTERNAL_SERVER_ERROR).send({ error: "Sorun var.." });
      res.status(hs.OK).send(userList);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const create = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  insert(req.body)
    .then((createdUser) => {
      if (!createdUser) res.status(hs.INTERNAL_SERVER_ERROR).send({ error: "Sorun var.." });
      res.status(hs.OK).send(createdUser);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const login = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  findOne(req.body)
    .then((user) => {
      if (!user) return res.status(hs.NOT_FOUND).send({ message: "Böyle bir kullanıcı bulunmamaktadır." });
      user = {
        ...user.toObject(),
        tokens: {
          access_token: generateJWTAccessToken(user),
          refresh_token: generateJWTRefreshToken(user),
        },
      };
      delete user.password;
      res.status(hs.OK).send(user);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

//! ÖDEV Video Üzerinden izleyip implemente edilecek.
// https://www.youtube.com/watch?v=pMi3PiITsMc

const resetPassword = (req, res) => {
  const new_password = uuid.v4()?.split("-")[0] || `usr-${new Date().getTime()}`;
  UserService.updateWhere({ email: req.body.email }, { password: passwordToHash(new_password) })
    .then((updatedUser) => {
      if (!updatedUser) return res.status(httpStatus.NOT_FOUND).send({ error: "No user with this email address or username has been found. " });

      eventEmitter.emit("send_email", {
        to: updatedUser.email,
        subject: "Reset Password",
        html: `Your password reset has been successfully completed. <br /> Don't forget to change your password after logging in! <br /> Your new password: <b>${new_password}</b>`,
      });

      res.status(httpStatus.OK).send({
        message: "We have sent the necessary information to your registered e-mail address for the password reset process.",
      });
    })
    .catch(() => res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: "A problem occurred while resetting the password." }));
};

module.exports = {
  index,
  create,
  login,
  resetPassword,
};

