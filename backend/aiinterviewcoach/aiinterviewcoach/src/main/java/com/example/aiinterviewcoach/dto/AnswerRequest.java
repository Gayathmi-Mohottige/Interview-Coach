package com.example.aiinterviewcoach.dto;

import lombok.Data;

@Data
public class AnswerRequest {
    private String sessionId;
    private String question;
    private String answer;
}
