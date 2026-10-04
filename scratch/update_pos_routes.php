<?php
$posRoutesFile = 'D:/Github/Utopia_react/backend/src/modules/pos/pos.routes.js';

$content = <<<'JS'
import express from 'express';
import { PosController } from './pos.controller.js';
import { validate } from '../../middleware/validate.js';
import { checkoutSchema } from './pos.dto.js';

const router = express.Router();

router.get('/', PosController.getJournal);
router.get('/journal', PosController.getJournal);
router.post('/checkout', validate(checkoutSchema), PosController.checkout);

export default router;
JS;

file_put_contents($posRoutesFile, $content);
echo "Updated pos.routes.js with GET / route\n";
