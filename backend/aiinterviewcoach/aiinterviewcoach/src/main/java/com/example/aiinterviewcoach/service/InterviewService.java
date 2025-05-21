package com.example.aiinterviewcoach.service;

import com.example.aiinterviewcoach.dto.AnswerRequest;
import com.example.aiinterviewcoach.model.QARecord;
import com.example.aiinterviewcoach.repository.QARecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class InterviewService {

    private final QARecordRepository qaRepo;
    private final GeminiService geminiService;

    public String generateUniqueQuestion(String category, String sessionId) {
        List<QARecord> previous = qaRepo.findBySessionId(sessionId);
        Set<String> pastQuestions = previous.stream()
                                            .map(QARecord::getQuestion)
                                            .collect(Collectors.toSet());

        int attempts = 0;
        while (attempts < 5) {
            String prompt = "You are a professional tech interviewer. Ask a single, concise " + category +
                " interview question for interns. Do NOT include greetings, intros, or explanations. " +
                "Avoid repeating any of these questions: " + String.join("; ", pastQuestions) +
                ". Return ONLY the question.";

            String candidate = geminiService.askGemini(prompt).trim();

            if (!pastQuestions.contains(candidate)) {
                QARecord qa = new QARecord(null, sessionId, candidate, "", "");
                qaRepo.save(qa);
                return candidate;
            }
            attempts++;
        }

        return "Sorry, couldn't generate a unique question. Please try again.";
    }

    public Map<String, Object> evaluateAnswer(AnswerRequest req) {
    String prompt = "Question: " + req.getQuestion() + "\n" +
                    "Answer: " + req.getAnswer() + "\n" +
                    "Evaluate and give only brief constructive feedback. Do not greet.";

    String feedback = geminiService.askGemini(prompt);
    QARecord record = qaRepo.findBySessionIdAndQuestion(req.getSessionId(), req.getQuestion());
    if (record != null) {
        record.setAnswer(req.getAnswer());
        record.setFeedback(feedback);
        qaRepo.save(record);
    }

    // Simple correctness heuristic (replace with actual check if needed)
    boolean isCorrect = feedback.toLowerCase().contains("correct") || feedback.toLowerCase().contains("good");

    String modelAnswerPrompt = "What is the ideal answer for the following interview question?\nQuestion: " + req.getQuestion();
    String modelAnswer = geminiService.askGemini(modelAnswerPrompt);

    Map<String, Object> response = new HashMap<>();
    response.put("feedback", feedback);
    response.put("correct", isCorrect);
    response.put("modelAnswer", modelAnswer);
    return response;
}

}
