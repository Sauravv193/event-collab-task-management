package aura.event_based_task.payload;

import lombok.Data;
import java.util.Set;

@Data
public class SignUpRequest {
    private String username;
    private String password;
    private Set<String> role;
}