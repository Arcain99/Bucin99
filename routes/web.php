<?php

use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// API routes for the Quiz & Responses
Route::prefix('api')->group(function () {
    Route::get('/quiz-data', [QuizController::class, 'getQuestions']);
    Route::post('/save-response', [QuizController::class, 'storeResponse']);
    Route::get('/responses', [QuizController::class, 'getResponses']);
});
