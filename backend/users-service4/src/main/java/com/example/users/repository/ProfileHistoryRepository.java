package com.example.users.repository;

import com.example.users.model.ProfileHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfileHistoryRepository extends JpaRepository<ProfileHistory, Long> {
    List<ProfileHistory> findByProfileIdOrderByUpdatedAtDesc(Long profileId);
    List<ProfileHistory> findByProfileId(Long profileId);
}
