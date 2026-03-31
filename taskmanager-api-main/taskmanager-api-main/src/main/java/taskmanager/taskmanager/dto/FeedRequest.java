
package taskmanager.taskmanager.dto;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class FeedRequest {

    private String message;
    private String recipientType; // ALL | SELECTED
    private List<Integer> recipientIds;
    private Integer isAnnouncement;

    // getters & setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRecipientType() {
        return recipientType;
    }

    public void setRecipientType(String recipientType) {
        this.recipientType = recipientType;
    }

    public List<Integer> getRecipientIds() {
        return recipientIds;
    }

    public void setRecipientIds(List<Integer> recipientIds) {
        this.recipientIds = recipientIds;
    }

    public Integer getIsAnnouncement() {
        return isAnnouncement;
    }

    public void setIsAnnouncement(Integer isAnnouncement) {
        this.isAnnouncement = isAnnouncement;
    }
}
