package taskmanager.taskmanager.service;

import taskmanager.taskmanager.dto.FeedRequest;
import taskmanager.taskmanager.model.Feed;
import taskmanager.taskmanager.model.FeedRecipient;
import taskmanager.taskmanager.repository.FeedRepository;
import taskmanager.taskmanager.repository.FeedRecipientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FeedService {

    @Autowired
    private FeedRepository feedRepository;

    @Autowired
    private FeedRecipientRepository feedRecipientRepository;

    @Transactional
    public void createFeed(FeedRequest dto, Integer senderId) {

        Feed feed = new Feed();
        feed.setSenderId(senderId);
        feed.setMessage(dto.getMessage());
        feed.setIsAnnouncement(dto.getIsAnnouncement() != null ? dto.getIsAnnouncement() : 0);

        if (dto.getIsAnnouncement() != null && dto.getIsAnnouncement() == 1) {
            feed.setIsGlobal(true);
            feedRepository.save(feed);
            return;
        }

        if ("ALL".equalsIgnoreCase(dto.getRecipientType())) {
            feed.setIsGlobal(true);
            feedRepository.save(feed);
            return;
        }

        feed.setIsGlobal(false);
        feedRepository.save(feed);

        for (Integer empId : dto.getRecipientIds()) {
            FeedRecipient fr = new FeedRecipient();
            fr.setFeedId(feed.getFeedId());
            fr.setEmpFkey(empId);
            feedRecipientRepository.save(fr);
        }
    }

//    public List<Feed> getFeedsForEmployeeOrGlobal(Integer empId) {

//     List<Feed> globalFeeds = feedRepository.findByIsGlobalTrue();

//     List<Feed> personalFeeds = feedRepository.findFeedsByEmployee(empId);

//     globalFeeds.addAll(personalFeeds);

//     globalFeeds.sort((a, b) ->
//         b.getCreatedAt().compareTo(a.getCreatedAt())
//     );

//     return globalFeeds;
// }

public List<Feed> getFeedsForEmployee(Integer empId) {
    return feedRepository.findFeedsForEmployee(empId);
}


}
