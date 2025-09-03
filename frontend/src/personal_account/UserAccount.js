import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Badge,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Alert,
  Spinner,
} from "reactstrap";
import { User, Calendar, Edit, Save, X, Settings, Shield, Bell, Key } from "lucide-react";
import axiosInstance from "../api/axios";
import UserAvatar from "../components/UserAvatar";
import "./style.css";
import Header from "../project_page/Header";

const UserAccount = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    avatar: "",
    date_joined: "",
    last_login: "",
    is_active: true,
    is_staff: false,
    is_superuser: false,
  });

  const [editData, setEditData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    avatar: "",
    date_joined: "",
    last_login: "",
    is_active: true,
    is_staff: false,
    is_superuser: false,
  });

  const [userStats, setUserStats] = useState({
    projects: 0,
    tasks: 0,
    comments: 0,
  });

  useEffect(() => {
    fetchUserData();
    fetchUserStats();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/users/me/");
      console.log("Fetched user data:", response.data);
      setUserData(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setMessage({ type: "danger", text: "Failed to load user data" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axiosInstance.get("/api/users/stats/");
      setUserStats(response.data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setEditData(prev => {
      if (!prev) return { [name]: value };
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log("Updating user with ID:", userData.id);
      console.log("Edit data:", editData);

      if (!userData.id) {
        throw new Error("User ID is not available");
      }

      const response = await axiosInstance.patch(`/api/users/${userData.id}/`, editData);
      setUserData(response.data);
      setEditData(response.data);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "danger", text: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const toggleTab = tab => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  if (isLoading) {
    return (
      <div className="user-account-loading">
        <Spinner color="primary" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="header-user-account">
        <Header />
      </div>
      <div className="user-account">
        {message.text && (
          <Alert color={message.type === "success" ? "success" : "danger"} className="mb-4">
            {message.text}
          </Alert>
        )}

        <Row>
          <Col lg={3} md={4} sm={12}>
            <Card className="profile-sidebar">
              <CardBody className="text-center">
                <div className="profile-avatar">
                  <UserAvatar user={userData} size="profile" className="mb-3" />
                  {isEditing && (
                    <Button color="link" size="sm" className="avatar-edit-btn">
                      <Edit />
                    </Button>
                  )}
                </div>

                <h4 className="profile-name">
                  {userData.first_name || userData.last_name
                    ? `${userData.first_name || ""} ${userData.last_name || ""}`.trim()
                    : userData.username}
                </h4>

                <div className="profile-status">
                  <Badge
                    color={
                      (userData.is_active !== undefined ? userData.is_active : true)
                        ? "success"
                        : "secondary"
                    }
                    className="status-badge"
                  >
                    {(userData.is_active !== undefined ? userData.is_active : true)
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>

                <div className="profile-stats mt-4">
                  <div className="stat-item">
                    <div className="stat-number">{userStats.projects}</div>
                    <div className="stat-label">Projects</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{userStats.tasks}</div>
                    <div className="stat-label">Tasks</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{userStats.comments}</div>
                    <div className="stat-label">Comments</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={9} md={8} sm={12}>
            <Card>
              <CardHeader>
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={activeTab === "profile" ? "active" : ""}
                      onClick={() => toggleTab("profile")}
                    >
                      <User className="me-2" />
                      Profile
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === "settings" ? "active" : ""}
                      onClick={() => toggleTab("settings")}
                    >
                      <Settings className="me-2" />
                      Settings
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === "security" ? "active" : ""}
                      onClick={() => toggleTab("security")}
                    >
                      <Shield className="me-2" />
                      Security
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === "notifications" ? "active" : ""}
                      onClick={() => toggleTab("notifications")}
                    >
                      <Bell className="me-2" />
                      Notifications
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardHeader>

              <CardBody>
                <TabContent activeTab={activeTab}>
                  {/* Profile Tab */}
                  <TabPane tabId="profile">
                    <div className="tab-header">
                      <h3>Personal Information</h3>
                      {!isEditing ? (
                        <Button color="primary" outline onClick={() => setIsEditing(true)}>
                          <Edit className="me-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div>
                          <Button
                            color="success"
                            className="me-2"
                            onClick={handleSave}
                            disabled={isSaving}
                          >
                            {isSaving ? <Spinner size="sm" /> : <Save />}
                            {isSaving ? " Saving..." : " Save Changes"}
                          </Button>
                          <Button color="secondary" outline onClick={handleCancel}>
                            <X className="me-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>

                    <Form>
                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="first_name">First Name</Label>
                            <Input
                              id="first_name"
                              name="first_name"
                              type="text"
                              value={isEditing ? editData.first_name : userData.first_name || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="form-control-lg"
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="last_name">Last Name</Label>
                            <Input
                              id="last_name"
                              name="last_name"
                              type="text"
                              value={isEditing ? editData.last_name : userData.last_name || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="form-control-lg"
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={isEditing ? editData.email : userData.email || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="form-control-lg"
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="username">Username</Label>
                            <Input
                              id="username"
                              name="username"
                              type="text"
                              value={userData.username || ""}
                              disabled
                              className="form-control-lg bg-light"
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label>Member Since</Label>
                            <div className="info-display">
                              <Calendar className="me-2" />
                              {userData.date_joined
                                ? new Date(userData.date_joined).toLocaleDateString()
                                : "Not specified"}
                            </div>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label>Last Login</Label>
                            <div className="info-display">
                              <Calendar className="me-2" />
                              {userData.last_login
                                ? new Date(userData.last_login).toLocaleDateString()
                                : "Never"}
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </TabPane>

                  {/* Settings Tab */}
                  <TabPane tabId="settings">
                    <h3>Account Settings</h3>
                    <p className="text-muted">Customize your account preferences</p>

                    <div className="settings-section">
                      <h5>Display Settings</h5>
                      <FormGroup check>
                        <Input type="checkbox" id="darkMode" />
                        <Label check for="darkMode">
                          Enable Dark Mode
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Input type="checkbox" id="compactView" />
                        <Label check for="compactView">
                          Compact View
                        </Label>
                      </FormGroup>
                    </div>

                    <div className="settings-section">
                      <h5>Language & Region</h5>
                      <FormGroup>
                        <Label for="language">Language</Label>
                        <Input type="select" id="language">
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </Input>
                      </FormGroup>
                      <FormGroup>
                        <Label for="timezone">Timezone</Label>
                        <Input type="select" id="timezone">
                          <option>UTC</option>
                          <option>EST</option>
                          <option>PST</option>
                          <option>GMT</option>
                        </Input>
                      </FormGroup>
                    </div>
                  </TabPane>

                  <TabPane tabId="security">
                    <h3>Security Settings</h3>
                    <p className="text-muted">Manage your account security</p>

                    <div className="security-section">
                      <h5>Password</h5>
                      <p>Change your password to keep your account secure</p>
                      <Button color="primary" outline>
                        <Key className="me-2" />
                        Change Password
                      </Button>
                    </div>

                    <div className="security-section">
                      <h5>Two-Factor Authentication</h5>
                      <p>Add an extra layer of security to your account</p>
                      <Button color="success" outline>
                        <Shield className="me-2" />
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="security-section">
                      <h5>Active Sessions</h5>
                      <p>Manage your active login sessions</p>
                      <Button color="info" outline>
                        View Active Sessions
                      </Button>
                    </div>
                  </TabPane>

                  <TabPane tabId="notifications">
                    <h3>Notification Preferences</h3>
                    <p className="text-muted">Choose how you want to be notified</p>

                    <div className="notification-section">
                      <h5>Email Notifications</h5>
                      <FormGroup check>
                        <Input type="checkbox" id="emailTasks" defaultChecked />
                        <Label check for="emailTasks">
                          Task assignments and updates
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Input type="checkbox" id="emailComments" defaultChecked />
                        <Label check for="emailComments">
                          Comments on your tasks
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Input type="checkbox" id="emailProjects" />
                        <Label check for="emailProjects">
                          Project updates and announcements
                        </Label>
                      </FormGroup>
                    </div>

                    <div className="notification-section">
                      <h5>In-App Notifications</h5>
                      <FormGroup check>
                        <Input type="checkbox" id="inAppTasks" defaultChecked />
                        <Label check for="inAppTasks">
                          Show task notifications
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Input type="checkbox" id="inAppComments" defaultChecked />
                        <Label check for="inAppComments">
                          Show comment notifications
                        </Label>
                      </FormGroup>
                    </div>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default UserAccount;
