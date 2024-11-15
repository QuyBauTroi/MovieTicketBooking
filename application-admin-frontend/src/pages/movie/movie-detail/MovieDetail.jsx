import { DeleteOutlined, LeftOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
  Upload,
  message,
  theme
} from "antd";
import dayjs from 'dayjs';
import "easymde/dist/easymde.min.css";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useGetActorsQuery } from "../../../app/services/actors.service";
import { useGetCountriesQuery } from "../../../app/services/countries.service";
import { useGetDirectorsQuery } from "../../../app/services/directors.service";
import { useGetGenresQuery } from "../../../app/services/genres.service";
import {
  useDeleteImageMutation,
  useGetImagesQuery,
  useUploadImageMutation,
} from "../../../app/services/images.service";
import {
  useDeleteMovieMutation,
  useGetMovieByIdQuery,
  useUpdateMovieMutation,
} from "../../../app/services/movies.service";
import AppBreadCrumb from "../../../components/layout/AppBreadCrumb";
import { API_DOMAIN } from "../../../data/constants";
import { formatDate } from "../../../utils/functionUtils";
import ReviewList from "../review-list/ReviewList";

const MovieDetail = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { movieId } = useParams();
  const imagesData = useSelector((state) => state.images);
  const { data: movie, isLoading: isFetchingMovie } =
    useGetMovieByIdQuery(movieId);
  const { isLoading: isFetchingImages } =
    useGetImagesQuery();

  const { data: countries, isLoading: isLoadingCountries } = useGetCountriesQuery();
  const { data: genres, isLoading: isLoadingGenres } = useGetGenresQuery();
  const { data: directors, isLoading: isLoadingDirectors } = useGetDirectorsQuery();
  const { data: actors, isLoading: isLoadingActors } = useGetActorsQuery();

  const images =
    imagesData &&
    imagesData.map((image) => {
      return {
        id: image.id,
        url: `${API_DOMAIN}${image.url}`,
      };
    });
  const [updateMovie, { isLoading: isLoadingUpdateMovie }] =
    useUpdateMovieMutation();
  const [deleteMovie, { isLoading: isLoadingDeleteMovie }] =
    useDeleteMovieMutation();
  const [uploadImage, { isLoading: isLoadingUploadImage }] =
    useUploadImageMutation();
  const [deleteImage, { isLoading: isLoadingDeleteImage }] =
    useDeleteImageMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSelected, setImageSelected] = useState(null);
  const [poster, setPoster] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // số lượng hình ảnh mỗi trang
  const totalImages = images.length; // tổng số hình ảnh
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalImages);
  const imagesRendered = images.slice(startIndex, endIndex);

  const breadcrumb = [
    { label: "Danh sách phim", href: "/admin/movies" },
    { label: movie?.title, href: `/admin/movies/${movie?.id}/detail` },
  ];

  useEffect(() => {
    if (movie && poster === null) {
      setPoster(movie?.poster.startsWith("/api") ? `${API_DOMAIN}${movie?.poster}` : movie?.poster);
    }
  }, [movie, poster]);

  if (isFetchingMovie || isFetchingImages || isLoadingCountries || isLoadingGenres || isLoadingDirectors || isLoadingActors) {
    return <Spin size="large" fullscreen />;
  }

  const onPageChange = page => {
    setCurrentPage(page);
  };

  const handleUpdate = () => {
    form.validateFields()
      .then((values) => {
        return updateMovie({ movieId, ...values }).unwrap();
      })
      .then((data) => {
        message.success("Cập nhật phim thành công!");
      })
      .catch((error) => {
        console.log(error);
        message.error(error.data.message);
      });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa phim này?",
      content: "Hành động này không thể hoàn tác!",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        deleteMovie(movie.id)
          .unwrap()
          .then((data) => {
            message.success("Xóa phim thành công!");
            setTimeout(() => {
              navigate("/admin/movies");
            }, 1500);
          })
          .catch((error) => {
            message.error(error.data.message);
          });
      },
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <OkBtn />
        </>
      ),
    });
  };

  const selecteImage = (image) => () => {
    setImageSelected(image);
  };

  const handleUploadImage = ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);
    uploadImage(formData)
      .unwrap()
      .then((data) => {
        onSuccess();
        message.success("Tải ảnh lên thành công!");
      })
      .catch((error) => {
        onError();
        message.error(error.data.message);
      });
  };

  const handleDeleteImage = () => {
    const imageObj = images.find((image) => image.url == imageSelected);
    if (!imageObj) {
      return;
    }
    deleteImage(imageObj.id)
      .unwrap()
      .then((data) => {
        message.success("Xóa ảnh thành công!");
        setImageSelected(null);
      })
      .catch((error) => {
        console.log(error);
        message.error(error.data.message);
      });
  };

  return (
    <>
      <Helmet>
        <title>{movie.name}</title>
      </Helmet>
      <AppBreadCrumb items={breadcrumb} />
      <div
        style={{
          padding: 24,
          minHeight: 360,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <Tabs>
          <Tabs.TabPane tab="Thông tin phim" key={1}>
            <Flex justify="space-between" align="center" style={{ marginBottom: "1rem" }}>
              <Space>
                <RouterLink to="/admin/movies">
                  <Button type="default" icon={<LeftOutlined />}>
                    Quay lại
                  </Button>
                </RouterLink>
                <Button
                  style={{ backgroundColor: "rgb(60, 141, 188)" }}
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleUpdate}
                  loading={isLoadingUpdateMovie}
                >
                  Cập nhật
                </Button>
              </Space>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                loading={isLoadingDeleteMovie}
              >
                Xóa phim
              </Button>
            </Flex>

            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              initialValues={{
                ...movie,
                genreIds: movie.genres.map((genre) => genre.id),
                directorIds: movie.directors.map((director) => director.id),
                actorIds: movie.actors.map((actor) => actor.id),
                countryId: movie.country.id,
                showDate: movie.showDate ? dayjs(formatDate(movie.showDate), 'DD/MM/YYYY') : null,
              }}
            >
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    label="Tên phim"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Tên phim không được để trống!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>

                  <Form.Item
                    label="Tên phim (tiếng anh)"
                    name="nameEn"
                    rules={[
                      {
                        required: true,
                        message: "Tên phim (tiếng anh) không được để trống!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter english name" />
                  </Form.Item>

                  <Form.Item
                    label="Trailer"
                    name="trailer"
                    rules={[
                      {
                        required: true,
                        message: "Trailer không được để trống!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter trailer" />
                  </Form.Item>

                  <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: "Mô tả không được để trống!",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder="Enter description"
                    />
                  </Form.Item>

                  <Form.Item label="Thể loại" name="genreIds">
                    <Select
                      mode="multiple"
                      style={{ width: "100%" }}
                      showSearch
                      placeholder="Select genres"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      options={genres.map((genre) => ({
                        label: genre.name,
                        value: genre.id,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item label="Đạo diễn" name="directorIds">
                    <Select
                      mode="multiple"
                      style={{ width: "100%" }}
                      showSearch
                      placeholder="Select directors"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      options={directors.map((director) => ({
                        label: director.name,
                        value: director.id,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item label="Diễn viên" name="actorIds">
                    <Select
                      mode="multiple"
                      style={{ width: "100%" }}
                      showSearch
                      placeholder="Select actors"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      options={actors.map((actor) => ({
                        label: actor.name,
                        value: actor.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Hình thức chiếu"
                    name="graphics"
                    rules={[
                      {
                        required: true,
                        message:
                          "Hình thức chiếu không được để trống!",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      style={{ width: "100%" }}
                      showSearch
                      placeholder="Select a graphics"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      options={[
                        { label: "2D", value: "_2D" },
                        { label: "3D", value: "_3D" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Hình thức dịch"
                    name="translations"
                    rules={[
                      {
                        required: true,
                        message:
                          "Hình thức dịch không được để trống!",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      style={{ width: "100%" }}
                      showSearch
                      placeholder="Select a graphics"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      options={[
                        { label: "Phụ đề", value: "SUBTITLING" },
                        { label: "Lồng tiếng", value: "DUBBING" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Độ tuổi xem phim"
                    name="age"
                    rules={[
                      {
                        required: true,
                        message:
                          "Độ tuổi xem phim không được để trống!",
                      },
                    ]}
                  >
                    <Select
                      style={{ width: "100%" }}
                      showSearch
                      placeholder="Select a age"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      options={[
                        { label: "P", value: "P" },
                        { label: "K", value: "K" },
                        { label: "T13", value: "T13" },
                        { label: "T16", value: "T16" },
                        { label: "T18", value: "T18" },
                        { label: "C", value: "C" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Ngày chiếu"
                    name="showDate"
                    rules={[
                      {
                        required: true,
                        message: "Ngày chiếu không được để trống!",
                      }
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} />
                  </Form.Item>

                  <Form.Item
                    label="Năm phát hành"
                    name="releaseYear"
                    rules={[
                      {
                        required: true,
                        message: "Năm phát hành không được để trống!",
                      },
                      {
                        validator: (_, value) => {
                          if (value <= 0) {
                            return Promise.reject(
                              "Năm phát hành phải lớn hơn 0!"
                            );
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber placeholder="Enter release year" style={{ width: "100%" }} />
                  </Form.Item>

                  <Form.Item
                    label="Thời lượng phim (phút)"
                    name="duration"
                    rules={[
                      {
                        required: true,
                        message: "Thời lượng phim không được để trống!",
                      },
                      {
                        validator: (_, value) => {
                          if (value <= 0) {
                            return Promise.reject(
                              "Thời lượng phim phải lớn hơn 0!"
                            );
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber placeholder="Enter duration" style={{ width: "100%" }} />
                  </Form.Item>

                  <Form.Item
                    label="Trạng thái"
                    name="status"
                    rules={[
                      {
                        required: true,
                        message:
                          "Trạng thái không được để trống!",
                      },
                    ]}
                  >
                    <Select
                      style={{ width: "100%" }}
                      showSearch
                      placeholder="Select a status"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      options={[
                        { label: "Nháp", value: false },
                        { label: "Công khai", value: true },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Quốc gia"
                    name="countryId"
                    rules={[
                      {
                        required: true,
                        message:
                          "Quốc gia không được để trống!",
                      },
                    ]}
                  >
                    <Select
                      style={{ width: "100%" }}
                      showSearch
                      placeholder="Select a country"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      options={countries.map((country) => ({
                        label: country.name,
                        value: country.id,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item name="poster">
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                    >
                      <img
                        style={{
                          width: "100%",
                          height: 300,
                          objectFit: "cover",
                        }}
                        src={poster}
                        alt="poster"
                      />
                      <Button
                        type="primary"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Thay đổi ảnh phim
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Modal
              title="Chọn ảnh của bạn"
              open={isModalOpen}
              onCancel={() => {
                setIsModalOpen(false);
                setImageSelected(null);
              }}
              footer={null}
              width={1200}
              style={{ top: 20 }}
            >
              <Flex justify="space-between" align="center">
                <Space direction="horizontal">
                  <Upload
                    maxCount={1}
                    customRequest={handleUploadImage}
                    showUploadList={false}
                  >
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "rgb(243, 156, 18)",
                      }}
                      loading={isLoadingUploadImage}
                    >
                      Tải ảnh lên
                    </Button>
                  </Upload>

                  <Button
                    type="primary"
                    disabled={!imageSelected}
                    onClick={() => {
                      setPoster(imageSelected);
                      setIsModalOpen(false);
                      form.setFieldsValue({
                        poster: imageSelected.slice(API_DOMAIN.length),
                      });
                    }}
                  >
                    Chọn ảnh
                  </Button>
                </Space>
                <Button
                  type="primary"
                  disabled={!imageSelected}
                  danger
                  onClick={handleDeleteImage}
                  loading={isLoadingDeleteImage}
                >
                  Xóa ảnh
                </Button>
              </Flex>

              <div style={{ marginTop: "1rem" }} id="image-container">
                <Row gutter={[16, 16]} wrap={true}>
                  {imagesRendered &&
                    imagesRendered.map((image, index) => (
                      <Col span={6} key={index}>
                        <div
                          className={`${imageSelected === image.url
                            ? "image-selected"
                            : ""
                            } image-item`}
                          onClick={selecteImage(image.url)}
                        >
                          <img
                            src={image.url}
                            alt={`image-${index}`}
                            style={{ width: "100%" }}
                          />
                        </div>
                      </Col>
                    ))}
                </Row>
              </div>

              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalImages}
                onChange={onPageChange}
                showSizeChanger={false}
                style={{ marginTop: 16, textAlign: 'center' }}
              />
            </Modal>
          </Tabs.TabPane>
          <Tabs.TabPane tab={`Đánh giá phim (${movie.reviews.length})`} key={2}>
            <ReviewList data={movie.reviews} movieId={movieId} />
          </Tabs.TabPane>
        </Tabs>

      </div>
    </>
  );
};

export default MovieDetail;
