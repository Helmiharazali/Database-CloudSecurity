package com.yourpackage.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Date;
import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "size_sq_ft")
    private String sizeSqFt;

    @Column(name = "property_type")
    private String propertyType;

    @Column(name = "no_of_floors")
    private int noOfFloors;

    @Column(name = "address")
    private String address;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "price")
    private double price;

    @Column(name = "year")
    private int year;

    @Column(name = "price_per_sqft")
    private double pricePerSqft;

    @Column(name = "facilities")
    private String facilities;

    @Column(name = "date_of_valuation")
    private Date dateOfValuation;

    // Cascade delete on favorites related to this property
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorite> favorites;

    // Adjusted cascade settings to prevent user deletion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", referencedColumnName = "id")
    private User agent;

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSizeSqFt() {
        return sizeSqFt;
    }

    public void setSizeSqFt(String sizeSqFt) {
        this.sizeSqFt = sizeSqFt;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public int getNoOfFloors() {
        return noOfFloors;
    }

    public void setNoOfFloors(int noOfFloors) {
        this.noOfFloors = noOfFloors;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public double getPricePerSqft() {
        return pricePerSqft;
    }

    public void setPricePerSqft(double pricePerSqft) {
        this.pricePerSqft = pricePerSqft;
    }

    public String getFacilities() {
        return facilities;
    }

    public void setFacilities(String facilities) {
        this.facilities = facilities;
    }

    public Date getDateOfValuation() {
        return dateOfValuation;
    }

    public void setDateOfValuation(Date dateOfValuation) {
        this.dateOfValuation = dateOfValuation;
    }

    public User getAgent() {
        return agent;
    }

    public void setAgent(User agent) {
        this.agent = agent;
    }
}
