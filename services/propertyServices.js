import { admin } from "../config/firebase.js"; // Importing admin instance

// Create a new property in Firestore with createdOn timestamp
export const createProperty = async (propertyData) => {
  try {
    const propertiesSnapshot = await admin
      .firestore()
      .collection("properties")
      .get(); // Using Admin SDK's firestore
    const propertyCount = propertiesSnapshot.size + 1; // Next property number
    const propertyNo = `PROP${propertyCount.toString().padStart(2, "0")}`;

    const propertyWithTimestamp = {
      ...propertyData,
      propertyNo, // Store property number
      createdOn: Date.now(),
      updatedOn: Date.now(),
    };

    const docRef = await admin
      .firestore()
      .collection("properties")
      .add(propertyWithTimestamp); // Using Admin SDK's firestore

    return { id: docRef.id, ...propertyWithTimestamp };
  } catch (error) {
    throw new Error("Error creating property: " + error.message);
  }
};

// Get all properties from Firestore sorted by createdOn in descending order (newest first)
export const getProperties = async () => {
  try {
    const propertiesQuery = admin
      .firestore()
      .collection("properties")
      .orderBy("createdOn", "desc"); // Using Admin SDK's firestore
    const querySnapshot = await propertiesQuery.get(); // Admin SDK method to get docs
    const properties = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return properties;
  } catch (error) {
    throw new Error("Error fetching properties: " + error.message);
  }
};

// Get top 5 properties sorted by createdOn in descending order (newest first)
export const getLatestProperties = async () => {
  try {
    const propertiesQuery = admin
      .firestore()
      .collection("properties")
      .orderBy("createdOn", "desc")
      .limit(5); // Admin SDK
    const querySnapshot = await propertiesQuery.get(); // Admin SDK method to get docs
    const properties = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return properties;
  } catch (error) {
    throw new Error("Error fetching top 5 properties: " + error.message);
  }
};

// Get a single property by ID from Firestore
export const getPropertyById = async (propertyId) => {
  try {
    const propertyRef = admin.firestore().doc(`properties/${propertyId}`); // Admin SDK for document reference
    const propertyDoc = await propertyRef.get(); // Admin SDK method to get document

    if (!propertyDoc.exists) {
      throw new Error("Property not found");
    }

    return { id: propertyDoc.id, ...propertyDoc.data() };
  } catch (error) {
    throw new Error("Error fetching property: " + error.message);
  }
};

// Update property data in Firestore
export const updateProperty = async (propertyId, propertyData) => {
  try {
    const updatedData = {
      ...propertyData,
      updatedOn: Date.now(), // Ensure updatedOn is always set
    };
    const propertyRef = admin.firestore().doc(`properties/${propertyId}`);
    await propertyRef.set(updatedData, { merge: true }); // Merge updated data
    return { id: propertyId, ...updatedData };
  } catch (error) {
    throw new Error("Error updating property: " + error.message);
  }
};

// Delete a property from Firestore
export const deleteProperty = async (propertyId) => {
  try {
    const propertyRef = admin.firestore().doc(`properties/${propertyId}`);
    await propertyRef.delete();
    return { message: "Property deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting property: " + error.message);
  }
};
