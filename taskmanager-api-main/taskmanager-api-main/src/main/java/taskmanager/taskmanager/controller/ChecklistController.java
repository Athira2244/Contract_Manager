package taskmanager.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import taskmanager.taskmanager.dto.ChecklistTemplateRequest;
import taskmanager.taskmanager.model.ChecklistTemplate;
import taskmanager.taskmanager.model.ChecklistTemplateItem;
import taskmanager.taskmanager.repository.ChecklistTemplateItemRepository;
import taskmanager.taskmanager.repository.ChecklistTemplateRepository;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/checklists")
@CrossOrigin(origins = "https://spboottestapi.mypayrollmaster.online/")
public class ChecklistController {

    private final ChecklistTemplateRepository templateRepo;
    private final ChecklistTemplateItemRepository itemRepo;

    public ChecklistController(ChecklistTemplateRepository templateRepo, ChecklistTemplateItemRepository itemRepo) {
        this.templateRepo = templateRepo;
        this.itemRepo = itemRepo;
    }

    @PostMapping("/templates")
    @Transactional
    public ChecklistTemplate createTemplate(@RequestBody ChecklistTemplateRequest request) {
        ChecklistTemplate template = new ChecklistTemplate();
        template.setName(request.getName());
        template.setCreatedBy(request.getCreatedBy());
        ChecklistTemplate saved = templateRepo.save(template);

        if (request.getItems() != null) {
            for (String itemText : request.getItems()) {
                ChecklistTemplateItem item = new ChecklistTemplateItem();
                item.setTemplateId(saved.getId());
                item.setItemText(itemText);
                itemRepo.save(item);
            }
        }
        return saved;
    }

    @GetMapping("/templates/user/{userId}")
    public List<ChecklistTemplate> getTemplatesByUser(@PathVariable Integer userId) {
        return templateRepo.findByCreatedBy(userId);
    }

    @GetMapping("/templates/{id}/items")
    public List<ChecklistTemplateItem> getTemplateItems(@PathVariable Long id) {
        return itemRepo.findByTemplateId(id);
    }

    @DeleteMapping("/templates/{id}")
    @Transactional
    public Map<String, String> deleteTemplate(@PathVariable Long id) {
        itemRepo.deleteByTemplateId(id);
        templateRepo.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Template deleted");
        return res;
    }
}
