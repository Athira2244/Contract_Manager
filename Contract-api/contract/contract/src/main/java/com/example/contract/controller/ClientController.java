package com.example.contract.controller;

import com.example.contract.entity.Client;
import com.example.contract.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:3000")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @Autowired
    private com.example.contract.repository.ClientRepository clientRepository;

    @GetMapping
    public List<Client> getAllClients(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        if ("Admin".equalsIgnoreCase(userRole)) {
            return clientService.getAllClients();
        } else if (userId != null) {
            return clientRepository.findByCreatedBy(userId);
        }
        return clientService.getAllClients();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable("id") Long id) {
        return clientService.getClientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Client createClient(
            @RequestBody Client client,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId != null) {
            client.setCreatedBy(userId);
        }
        return clientService.createClient(client);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable("id") Long id, @RequestBody Client clientDetails) {
        try {
            return ResponseEntity.ok(clientService.updateClient(id, clientDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable("id") Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.ok().build();
    }
}
