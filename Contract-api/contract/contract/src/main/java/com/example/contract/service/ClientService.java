package com.example.contract.service;

import com.example.contract.entity.Client;
import com.example.contract.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    public Client createClient(Client client) {
        return clientRepository.save(client);
    }

    public Client updateClient(Long id, Client clientDetails) {
        Client client = clientRepository.findById(id).orElseThrow(() -> new RuntimeException("Client not found"));
        client.setName(clientDetails.getName());
        client.setGstin(clientDetails.getGstin());
        client.setPan(clientDetails.getPan());
        client.setAddress(clientDetails.getAddress());
        client.setContactPerson(clientDetails.getContactPerson());
        client.setEmail(clientDetails.getEmail());
        client.setPhone(clientDetails.getPhone());
        client.setAssignedSalesPerson(clientDetails.getAssignedSalesPerson());
        client.setAccountManager(clientDetails.getAccountManager());
        client.setStatus(clientDetails.getStatus());
        return clientRepository.save(client);
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
}
