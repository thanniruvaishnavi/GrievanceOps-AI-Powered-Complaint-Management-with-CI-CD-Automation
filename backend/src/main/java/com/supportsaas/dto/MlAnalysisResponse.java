package com.supportsaas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Mirrors the JSON contract returned by the FastAPI ML microservice. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlAnalysisResponse {
    private String category;
    private String priority;          // LOW / MEDIUM / HIGH / CRITICAL
    private double sentimentScore;    // -1..1
    private boolean isDuplicate;
    private Long duplicateOfTicketId;
    private List<Double> embedding;   // optional, for future vector search
}
