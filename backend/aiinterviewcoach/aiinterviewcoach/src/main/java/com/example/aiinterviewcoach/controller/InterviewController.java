package com.example.aiinterviewcoach.controller;

import com.example.aiinterviewcoach.dto.AnswerRequest;
import com.example.aiinterviewcoach.service.InterviewService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/ask")
    public String ask(@RequestParam String category, @RequestParam String sessionId) {
        return interviewService.generateUniqueQuestion(category, sessionId);
    }

    @PostMapping("/answer")
    public ResponseEntity<Map<String, Object>> evaluate(@RequestBody AnswerRequest req) {
    return ResponseEntity.ok(interviewService.evaluateAnswer(req));
}

}
