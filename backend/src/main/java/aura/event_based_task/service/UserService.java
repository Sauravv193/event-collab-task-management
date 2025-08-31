package aura.event_based_task.service;

import aura.event_based_task.model.User;
import aura.event_based_task.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Finds a user by their ID.
     * @param id The ID of the user to find.
     * @return An Optional containing the user if found, or an empty Optional otherwise.
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}