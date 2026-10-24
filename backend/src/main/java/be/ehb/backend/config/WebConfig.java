package be.ehb.backend.config;
/**
 * Web MVC configuratie voor de applicatie.
 * Registreert resource handlers om geüploade bestanden (zoals boekomslagen)
 * rechtstreeks toegankelijk te maken via de /uploads/** URL.
 */
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}