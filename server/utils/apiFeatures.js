class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryStr = queryString;
  }
  filter() {
    // 1.A] Filtering
    const queryObj = { ...this.queryStr };
    const excludedFields = ["page", "sort", "fields", "limit"];

    excludedFields.forEach((el) => delete queryObj[el]);
    // 1.B] Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(
      queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    );
    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    //2] Sorting
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  fields() {
    //3] Fields
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  page() {
    // 4]Pagination
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default ApiFeatures;
