package aura.event_based_task.payload;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}