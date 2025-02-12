const response = async (res, statut, message, data) => {
    console.log(message);
    await res.status(statut).json({
        statut: statut==200 || statut==201 ? "SUCCESS" : "ERROR", 
        message, 
        data
    })
}

module.exports = response;