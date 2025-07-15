const response = async (res, statut_code, message, data, analytics) => {
    
    await res.status(statut_code).json({
        statut: statut_code==200 || statut_code==201 ? "SUCCESS" : "ERROR", 
        message, 
        analytics,
        data
    })
    
    statut_code==200 || statut_code==201 ? console.log(message) : console.error(message);
}

module.exports = response;