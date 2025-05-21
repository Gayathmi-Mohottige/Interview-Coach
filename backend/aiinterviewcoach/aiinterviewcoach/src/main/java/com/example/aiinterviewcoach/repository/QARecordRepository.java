package com.example.aiinterviewcoach.repository;

import com.example.aiinterviewcoach.model.QARecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QARecordRepository extends MongoRepository<QARecord, String> {
    List<QARecord> findBySessionId(String sessionId);
    QARecord findBySessionIdAndQuestion(String sessionId, String question);
}