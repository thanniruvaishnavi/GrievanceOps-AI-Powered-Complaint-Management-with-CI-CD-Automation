package com.supportsaas.repository;

import com.supportsaas.entity.Priority;
import com.supportsaas.entity.Ticket;
import com.supportsaas.entity.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Page<Ticket> findByCreatedById(Long userId, Pageable pageable);

    Page<Ticket> findByAssignedToId(Long resolverId, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    List<Ticket> findTop50ByOrderByCreatedAtDesc();

    @Query("select count(t) from Ticket t where t.status = :status")
    long countByStatus(TicketStatus status);

    @Query("select count(t) from Ticket t where t.priority = :priority and t.status not in ('RESOLVED','CLOSED')")
    long countOpenByPriority(Priority priority);

    @Query("select t.category, count(t) from Ticket t group by t.category")
    List<Object[]> countGroupedByCategory();
}
