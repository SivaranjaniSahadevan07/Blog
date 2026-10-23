import React from "react";
import CategoryForm from "./CategoryForm"
import Categories from "./Categories";

const CreateCategory = () => {
  return (
    <main className="category-admin-page">
      <div className="category-admin-shell">
        <header className="category-admin-heading">
          <span className="eyebrow">EDITORIAL TOOLKIT</span>
          <h1>Shape the journal.</h1>
          <p>Keep stories organized with thoughtful topics readers can explore.</p>
        </header>
        <CategoryForm />
        <section className="category-manage-card">
          <div className="category-manage-heading">
            <div>
              <span className="eyebrow">DISCOVERABLE STORIES</span>
              <h2>Your categories</h2>
            </div>
            <span className="category-manage-note">Select a topic to keep your journal tidy</span>
          </div>
          <Categories />
        </section>
      </div>
    </main>
  );
};

export default CreateCategory;
