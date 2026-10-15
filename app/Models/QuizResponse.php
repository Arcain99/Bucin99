<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizResponse extends Model
{
    protected $fillable = [
        'respondent_name',
        'answers',
        'final_answer',
        'message',
        'chosen_date_activity',
    ];

    protected $casts = [
        'answers' => 'array',
    ];
}
