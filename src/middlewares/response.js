const response = async (res, statut_code, message, data, analytics) => {
    console.log(message);
    await res.status(statut_code).json({
        statut: statut_code==200 || statut_code==201 ? "SUCCESS" : "ERROR", 
        message, 
        analytics,
        data
    })
}

module.exports = response;