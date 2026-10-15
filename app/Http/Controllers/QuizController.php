<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\QuizResponse;

class QuizController extends Controller
{
    /**
     * Get default quiz questions
     */
    public function getQuestions(Request $request)
    {
        $name = $request->query('name', 'Loili');

        $questions = [
            [
                'id' => 1,
                'title' => 'Pertanyaan Pembuka ✨',
                'question' => "Hal apa yang paling bikin kamu kepikiran waktu pertama kali kenal aku?",
                'type' => 'options',
                'options' => [
                    ['id' => 'a', 'label' => 'Senyumnya manis banget bikin salting 😊', 'emoji' => '🌸'],
                    ['id' => 'b', 'label' => 'Orangnya asyik & seru diajak ngobrol 💬', 'emoji' => '✨'],
                    ['id' => 'c', 'label' => 'Sedikit misterius tapi bikin penasaran 👀', 'emoji' => '🔍'],
                    ['id' => 'd', 'label' => 'Langsung ada chemistry yang klik! ⚡', 'emoji' => '💘'],
                ],
            ],
            [
                'id' => 2,
                'title' => 'Momen Favorit 🍨',
                'question' => "Kalau kita pergi jalan berdua akhir pekan ini, kamu lebih pilih vibe yang mana?",
                'type' => 'options',
                'options' => [
                    ['id' => 'a', 'label' => 'Nongkrong di coffee shop aesthetic sambil ngobrol santai ☕', 'emoji' => '🌿'],
                    ['id' => 'b', 'label' => 'Nonton bioskop & kulineran street food malam hari 🍿', 'emoji' => '🍜'],
                    ['id' => 'c', 'label' => 'Jalan sore di taman / pantai nikmati sunset 🌅', 'emoji' => '🏖️'],
                    ['id' => 'd', 'label' => 'Photo booth seru-seruan & cari es krim bareng 🍦', 'emoji' => '📸'],
                ],
            ],
            [
                'id' => 3,
                'title' => 'Ujian Kejujuran 🤭',
                'question' => "Seberapa persen tingkat kangen kamu kalau sehari aja kita nggak saling kabar?",
                'type' => 'slider',
                'min' => 0,
                'max' => 100,
                'defaultValue' => 95,
                'unit' => '%',
                'descriptions' => [
                    '0' => 'Biasa aja kok 😒',
                    '50' => 'Agak kepikiran sih... 🤔',
                    '80' => 'Kangen berat! ❤️',
                    '100' => 'Nggak tahan pengen spam chat terus! 🚨💖'
                ],
            ],
            [
                'id' => 4,
                'title' => 'Hati-Hati Menjawab ⚠️',
                'question' => "Siapa yang biasanya paling lucu, ngangenin, dan selalu bikin hari jadi lebih cerah?",
                'type' => 'options',
                'options' => [
                    ['id' => 'a', 'label' => 'Pasti kamu lah, siapa lagi? 💐', 'emoji' => '🥰'],
                    ['id' => 'b', 'label' => 'Aku dan kamu saat kita bareng-bareng! 👫', 'emoji' => '🌟'],
                    ['id' => 'c', 'label' => 'Kamu yang selalu bikin ketawa 🤣', 'emoji' => '💌'],
                ],
            ],
            [
                'id' => 5,
                'title' => 'Pertanyaan Pamungkas 💍💝',
                'question' => "Maukah kamu jadi orang teristimewa di hatiku dan jalanin hari-hari indah ini bareng aku?",
                'subtitle' => 'Pikirkan baik-baik ya, ini keputusan paling manis hari ini! 🥺👉👈',
                'type' => 'final',
                'yesLabel' => 'Iya! Tentu Saja Mau! 💖',
                'noLabel' => 'Enggak dulu deh... 🙈',
            ],
        ];

        return response()->json([
            'partnerName' => $name,
            'questions' => $questions,
        ]);
    }

    /**
     * Store respondent answer
     */
    public function storeResponse(Request $request)
    {
        $validated = $request->validate([
            'respondent_name' => 'nullable|string|max:100',
            'answers' => 'nullable|array',
            'final_answer' => 'required|string|max:50',
            'message' => 'nullable|string|max:1000',
            'chosen_date_activity' => 'nullable|string|max:255',
        ]);

        $response = QuizResponse::create([
            'respondent_name' => $validated['respondent_name'] ?? 'Loili',
            'answers' => $validated['answers'] ?? [],
            'final_answer' => $validated['final_answer'] ?? 'Iya',
            'message' => $validated['message'] ?? null,
            'chosen_date_activity' => $validated['chosen_date_activity'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jawaban berhasil disimpan dengan penuh cinta! 🥰',
            'data' => $response,
        ]);
    }

    /**
     * Retrieve all saved responses (history)
     */
    public function getResponses()
    {
        $responses = QuizResponse::latest()->take(20)->get();

        return response()->json([
            'responses' => $responses,
        ]);
    }
}
