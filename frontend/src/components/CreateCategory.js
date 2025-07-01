import React from "react";
// import { useSelector } from "react-redux";
import CategoryForm from "./CategoryForm"
import Categories from "./Categories";

const CreateCategory = () => {

  // const { user } = useSelector((state) => state.auth);

  return (
    <div className="container-fluid p-md-5 p-3 bg-dark-subtle">

      <br />
      {/* Category Creation */}
      <CategoryForm />
      <br />
      <div className="d-flex justify-content-center">
        <Categories />
      </div>

    </div>
  );
};

export default CreateCategory;
