import { Request, Response, NextFunction } from 'express';
import { ValidationRules } from '../utils/validationRules';

export const validateResourceCompatibility = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { atelierId, machineId, ouvrierId } = req.body;

        if (atelierId && machineId) {
            const isValid = await ValidationRules.validateAtelierMachineUsage(atelierId, machineId);
            if (!isValid) {
                return res.status(400).json({ 
                    message: 'Incompatibilité entre l\'usage de l\'atelier et de la machine' 
                });
            }
        }

        if (ouvrierId && atelierId) {
            const isValid = await ValidationRules.validateOuvrierAtelier({ ouvrierId, atelierId });
            if (!isValid) {
                return res.status(400).json({ 
                    message: 'L\'ouvrier n\'a pas les compétences requises pour cet atelier' 
                });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la validation' });
    }
};