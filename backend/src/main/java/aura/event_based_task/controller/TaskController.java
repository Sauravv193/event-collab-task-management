package aura.event_based_task.controller;

import aura.event_based_task.model.Task;
import aura.event_based_task.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping("/event/{eventId}")
    public List<Task> getTasksByEvent(@PathVariable Long eventId) {
        return taskService.findTasksByEventId(eventId);
    }

    // *** FIX: Updated the endpoint to accept eventId as a path variable. ***
    @PostMapping("/event/{eventId}")
    public Task createTask(@RequestBody Task task, @PathVariable Long eventId) {
        return taskService.createTask(task, eventId);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(@PathVariable Long taskId, @RequestBody Task taskDetails) {
        return taskService.updateTask(taskId, taskDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
        if (taskService.deleteTask(taskId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
