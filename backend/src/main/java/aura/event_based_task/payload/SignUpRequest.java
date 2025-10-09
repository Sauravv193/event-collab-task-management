package aura.event_based_task.payload;

import aura.event_based_task.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.Set;

@Data
public class SignUpRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;
    
    @NotBlank(message = "Password is required")
    @ValidPassword
    private String password;
    
    private Set<String> role;
    
    @Size(max = 50, message = "Email must be less than 50 characters")
    private String email;
    
    @Size(max = 100, message = "Full name must be less than 100 characters")
    private String fullName;
}
