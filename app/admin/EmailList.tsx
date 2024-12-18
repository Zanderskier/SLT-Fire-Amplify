"use client";

import { useEmailListLogic } from "./EmailListLogic"; // Import the logic file
import { useCollapse } from "../supportFunctions/ToggleCollase";
import "@aws-amplify/ui-react/styles.css";
import "../page.module.css";
import "./admin.css";

export default function EmailList() {
  const {
    emails,
    emailError,
    emailInput,
    setEmailInput,
    selectedEmails,
    emailSearchQuery,
    setEmailSearchQuery,
    handleSearchEmails,
    handleEmailSubmit,
    handleEmailCheckboxChange,
    handleBulkDeleteEmails,
    handleDeleteEmail,
  } = useEmailListLogic();

  const { isContentCollapsed, toggleCollapse } = useCollapse();

  return (
    <>
      <div className="div">
        <h2 className="admin-h2" onClick={toggleCollapse}>
          Email List{" "}
          <span
            className={`dropdown-arrow ${
              isContentCollapsed ? "collapsed" : ""
            }`}
            style={{
              display: "inline-block",
              marginLeft: "8px",
              transition: "transform 0.3s",
              transform: isContentCollapsed ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          >
            ▼
          </span>
        </h2>
        {isContentCollapsed && (
          <>
            {/* Container for emails with scroll */}
            <div className="email-list-parent">
              <div
                className="email-search-container"
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="text"
                  value={emailSearchQuery}
                  onChange={(e) => setEmailSearchQuery(e.target.value)}
                  placeholder="Search by Email"
                  style={{ marginRight: "10px" }}
                />
                <button
                  onClick={handleSearchEmails}
                  className="button"
                  style={{ marginRight: "20px" }}
                >
                  Search
                </button>
                <button
                  className="deleteButton"
                  onClick={handleBulkDeleteEmails}
                >
                  Delete Selected
                </button>
              </div>
              <div className="email-list-container">
                <table className="admin-about-us-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((email) => (
                      <tr key={email.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedEmails.has(email.id)}
                            onChange={() => handleEmailCheckboxChange(email.id)}
                          />
                        </td>
                        <td>{email.email}</td>
                        <td>
                          <button onClick={() => handleDeleteEmail(email.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Display error message */}
            {emailError && <div className="error-message">{emailError}</div>}

            <br />
            <div>
              <form onSubmit={handleEmailSubmit} className="add-email-form">
                <div className="form-group">
                  <label className="admin-h3" htmlFor="email">
                    Add Email
                  </label>
                  <input
                    id="email"
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter Email Address"
                    className="form-input"
                  />
                </div>
                <button type="submit" className="button">
                  Create Entry
                </button>
              </form>
            </div>
            <br />
            {/* SES email send to entire email list */}
            <div className="email-body">
              <h2 className="admin-h3">Send News Letter</h2>
              {/* Subject input field */}
              <div className="form-group">
                <label htmlFor="subject" className="admin-h3">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Enter Email Subject"
                  className="form-input"
                />
              </div>

              {/* Email body textarea */}
              <div className="form-group">
                <label htmlFor="emailBody" className="admin-h3">
                  Email Body
                </label>
                <textarea
                  id="emailBody"
                  className="form-input"
                  placeholder="Enter email body"
                  rows={6}
                ></textarea>
              </div>

              {/* Email List button */}
              <div className="divButton">
                <button>Email List</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
