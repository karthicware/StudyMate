package com.studymate.backend.service;

import com.studymate.backend.exception.InvalidRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service for handling file storage operations.
 * Stores files locally in the configured upload directory.
 */
@Service
@Slf4j
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("File storage location initialized at: {}", this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, ex);
        }
    }

    /**
     * Store a file in the specified subdirectory.
     *
     * @param file        the file to store
     * @param subdirectory the subdirectory within the upload directory (e.g., "avatars")
     * @return the public URL to access the file
     * @throws InvalidRequestException if file storage fails
     */
    public String store(MultipartFile file, String subdirectory) {
        if (file.isEmpty()) {
            throw new InvalidRequestException("Cannot store empty file");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.contains("..")) {
            throw new InvalidRequestException("Invalid filename: " + originalFilename);
        }

        try {
            // Generate unique filename
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID() + fileExtension;

            // Create subdirectory path
            Path targetLocation = this.fileStorageLocation.resolve(subdirectory);
            Files.createDirectories(targetLocation);

            // Store file
            Path filePath = targetLocation.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("File stored successfully: {}", filePath);

            // Return relative URL (in production, this would be a full URL to CDN or static server)
            return "/" + subdirectory + "/" + uniqueFilename;

        } catch (IOException ex) {
            log.error("Failed to store file: {}", originalFilename, ex);
            throw new InvalidRequestException("Failed to store file: " + ex.getMessage());
        }
    }

    /**
     * Delete a file from storage.
     *
     * @param fileUrl the URL of the file to delete
     */
    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // Extract relative path from URL
            String relativePath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
            Path filePath = this.fileStorageLocation.resolve(relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", filePath);
            }
        } catch (IOException ex) {
            log.warn("Failed to delete file: {}", fileUrl, ex);
            // Don't throw exception on delete failure - it's not critical
        }
    }

    /**
     * Get file extension including the dot.
     *
     * @param filename the filename
     * @return the file extension (e.g., ".jpg") or empty string if no extension
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return (lastDotIndex > 0) ? filename.substring(lastDotIndex) : "";
    }
}
