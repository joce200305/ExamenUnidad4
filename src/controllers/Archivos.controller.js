const carga_imagen = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            error: "No se ha subido ningún archivo" 
        });
    }

    res.status(200).json({
        success: true,
        imagePath: `/uploads/${req.file.filename}`,
        filename: req.file.filename
    });
};

export { carga_imagen };