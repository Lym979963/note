package com.ittest.pojo;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Article {
    private Integer id;//主键ID

    @NotEmpty(message = "标题不能为空")
    @Pattern(regexp = "^[\\s\\S]{1,50}$", message = "标题长度1-50个字符")
    private String title;//文章标题

    @NotEmpty(message = "内容不能为空")
    private String content;//文章内容（Markdown格式，包含图片链接）

    @NotNull(message = "分类不能为空")
    private Integer categoryId;//文章分类id

    private Integer createUser;//创建人ID
    private LocalDateTime createTime;//创建时间
    private LocalDateTime updateTime;//更新时间
}