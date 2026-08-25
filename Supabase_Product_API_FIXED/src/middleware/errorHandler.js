module.exports = (err, req, res, next) => {

    console.log("ERROR DETAILS:");
    console.log(err);

    res.status(500).json({
        success: false,
        error: err.message || err
    });

};