package com.example.aiinterviewcoach.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document
public class QARecord {
    @Id
    private String id;
    private String sessionId;
    private String question;
    private String answer;
    private String feedback;
}