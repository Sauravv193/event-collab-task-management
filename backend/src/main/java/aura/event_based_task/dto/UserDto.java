package aura.event_based_task.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;

    public UserDto() {}

    public UserDto(Long id, String username, String email, String fullName, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public UserDto(Long id, String username) {
        this.id = id;
        this.username = username;
    }
}