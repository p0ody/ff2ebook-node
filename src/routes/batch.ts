import * as express from "express";
import * as Logging from "../Logging";

let router = express.Router();


router.get('/', function (req, res, next)
{
    var autoDownload = (req.cookies.batchAutoDL == "true") ? "checked=\"\"" : "";
    var sendEmail = (req.cookies.batchSendEmail == "true") ? "checked=\"\"" : "";
    var epub, mobi;
    if (req.cookies.batchFileType == "EPUB")
    {
        epub = "selected=\"selected\"";
        mobi = "";
    }
    else
    {
        epub = "";
        mobi = "selected=\"selected\"";
    }

    res.render('batch',
        {
            autoDL: autoDownload,
            typeEpub: epub,
            typeMobi: mobi,
            sendEmail: sendEmail,
            emailAddress: req.cookies.batchEmail
        });
});

router.post('/setCookie', function (req, res, next)
{
    res.cookie("batchAutoDL", req.body.autoDL);
    res.cookie("batchFileType", req.body.fileType);
    res.cookie("batchSendEmail", req.body.sendEmail);
    res.cookie("batchEmail", req.body.email);
    res.send("Cookie set.");
});

module.exports = router;