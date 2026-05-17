package com.RentCote.RentCote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.RentCote.RentCote", "com.saas.rentals"})
@EntityScan(basePackages = "com.saas.rentals.model")
@EnableJpaRepositories(basePackages = "com.saas.rentals.repository")
public class RentCoteApplication {

	public static void main(String[] args) {
		SpringApplication.run(RentCoteApplication.class, args);
	}

}
