import { handler } from './dist/handler.js';
import express from 'express';

const app = express();

app.use(function(_, res, next) {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
});

app.use(handler);

app.listen(3000);