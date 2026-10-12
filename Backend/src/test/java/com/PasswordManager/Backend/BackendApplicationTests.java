package com.PasswordManager.Backend;

import com.PasswordManager.Backend.model.User;
import com.PasswordManager.Backend.model.Credential;
import com.PasswordManager.Backend.repository.CredentialRepository;
import com.PasswordManager.Backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private CredentialRepository credentialRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void registrationPersistsUserAndLoginAuthenticatesAgainstDatabase() throws Exception {
		String username = "integration-" + UUID.randomUUID();
		String password = "test-password";
		String requestBody = objectMapper.createObjectNode()
				.put("username", username)
				.put("password", password)
				.toString();

		mockMvc.perform(post("/api/user/register")
				.contentType(MediaType.APPLICATION_JSON)
				.header("Origin", "http://127.0.0.1:5173")
				.content(requestBody))
				.andExpect(status().isCreated())
				.andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:5173"));

		User storedUser = userRepository.findByUsername(username).orElseThrow();
		assertNotEquals(password, storedUser.getPassword());

		String loginResponse = mockMvc.perform(post("/api/user/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(requestBody))
				.andExpect(status().isOk())
				.andExpect(cookie().exists("refreshToken"))
				.andReturn()
				.getResponse()
				.getContentAsString();
		JsonNode loginData = objectMapper.readTree(loginResponse);
		String accessToken = loginData.get("token").asText();
		assertFalse(accessToken.isBlank());

		mockMvc.perform(get("/api/user/me")
				.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value(username))
				.andExpect(jsonPath("$.password").doesNotExist())
				.andExpect(jsonPath("$.refreshToken").doesNotExist());

		String websitePassword = "vault-password-" + UUID.randomUUID();
		String credentialBody = objectMapper.createObjectNode()
				.put("serviceName", "Example site")
				.put("username", "site-user")
				.put("password", websitePassword)
				.toString();

		mockMvc.perform(post("/api/credentials/add")
				.header("Authorization", "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(credentialBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.serviceName").value("Example site"))
				.andExpect(jsonPath("$.username").value("site-user"))
				.andExpect(jsonPath("$.password").value(websitePassword));

		Credential storedCredential = credentialRepository.findByUser(storedUser).get(0);
		assertNotEquals(websitePassword, storedCredential.getPassword());
		assertTrue(storedCredential.getPassword().startsWith("enc:v1:"));

		mockMvc.perform(get("/api/credentials/me")
				.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].serviceName").value("Example site"))
				.andExpect(jsonPath("$[0].username").value("site-user"))
				.andExpect(jsonPath("$[0].password").value(websitePassword));

		String updatedPassword = "updated-vault-password-" + UUID.randomUUID();
		String updateBody = objectMapper.createObjectNode()
				.put("id", storedCredential.getId())
				.put("serviceName", "Example site")
				.put("username", "updated-site-user")
				.put("password", updatedPassword)
				.toString();

		mockMvc.perform(put("/api/credentials/change")
				.header("Authorization", "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(updateBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value("updated-site-user"))
				.andExpect(jsonPath("$.password").value(updatedPassword));

		Credential updatedCredential = credentialRepository.findById(storedCredential.getId()).orElseThrow();
		assertTrue(updatedCredential.getPassword().startsWith("enc:v1:"));

		mockMvc.perform(delete("/api/credentials/delete/" + storedCredential.getId())
				.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/credentials/me")
				.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").isEmpty());
	}
}
