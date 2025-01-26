const express = require("express");
const router = express.Router();
const Resv = require("../models/resvSchema");
const Idx = require("../models/idxSchema");
const IdxOthers = require("../models/idxOthersSchema");
router.route("/reservations");

router.get("/reservations", async (req, res) => {
  await Resv.find()
    .then((resvs) => {
      res.send({ sts: "ok", resvs: resvs });
    })
    .catch(() => {
      res.send({ sts: "err", message: "Network Error, Please Try Again" });
    });
});

router.post("/reservations/", async (req, res) => {
  let userName = req.body.userName;
  let phoneNum1 = req.body.phoneNum1;
  let year = req.body.year;
  let sid = req.body.sid;
  let idxs = await Idx.find().catch(() => {
    res.send({ sts: "err", message: "Network Error, Please Try Again" });
    return;
  });
  let idxos = await IdxOthers.find().catch(() => {
    res.send({ sts: "err", message: "Network Error, Please Try Again" });
    return;
  });

  let match = false;

  switch (year) {
    case "intern":
      if (idxs.length >= 300) {
        res.send({
          sts: "err",
          message: "We Are Sorry, All Seats Have Been Reserved",
        });
        return;
      } else {
        await Idx.find({ idx: sid })
          .then(async (u) => {
            if (u.length > 0) {
              res.send({
                sts: "err",
                message: "You Have Already Registered A Seat",
              });
              return;
            } else {
              let sidhash =
                Math.ceil((Number(sid) * 1787) / 131) +
                userName.toString().substr(-1);
              let thisResv = new Resv({
                userName: userName,
                phoneNum1: phoneNum1,
                year: year,
                sid: sid,
                code: sidhash,
              });
              let idxNew = new Idx({
                idx: sid,
              });
              await thisResv.save().then(async () => {
                await idxNew.save().then(() => {
                  res.send({ sts: "ok", code: sidhash });
                });
              });
            }
          })
          .catch(() => {
            res.send({
              sts: "err",
              message: "Network Error, Please Try Again",
            });
          });
      }
      break;
    default:
      if (idxos.length >= 50) {
        res.send({
          sts: "err",
          message: "We Are Sorry, All Seats Have Been Reserved",
        });
        return;
      } else {
        await IdxOthers.find({ idxothers: sid })
          .then(async (u) => {
            if (u.length > 0) {
              for (let y of u) {
                if (y.year == year) {
                  res.send({
                    sts: "err",
                    message: "You Have Already Registered A Seat",
                  });
                  match = true;
                  break;
                }
              }
            }
            if (match == false) {
              let sidhash =
                Math.ceil((Number(sid) * 1787) / 131) +
                userName.toString().substr(-1);
              let thisResv = new Resv({
                userName: userName,
                phoneNum1: phoneNum1,
                year: year,
                sid: sid,
                code: sidhash,
              });
              let idxOthersNew = new IdxOthers({
                idxothers: sid,
                year: year,
              });
              await thisResv.save().then(async () => {
                await idxOthersNew.save().then(() => {
                  res.send({ sts: "ok", code: sidhash });
                });
              });
            }
          })
          .catch(() => {
            res.send({
              sts: "err",
              message: "Network Error, Please Try Again",
            });
          });
      }
      break;
  }
});
// router.delete( '/reservations/:id', async ( req, res ) => {
//     const all = await Resv.find();
//     const ths = all[ req.params.id ];
//     await Resv.deleteOne( ths );
//     res.send( 'ok' )
// } );
module.exports = router;
